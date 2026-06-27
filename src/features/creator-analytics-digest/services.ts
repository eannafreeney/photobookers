import {
  and,
  asc,
  count,
  eq,
  gte,
  isNotNull,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { db } from "../../db/client";
import {
  artistOfTheWeek,
  bookOfTheDay,
  books,
  creatorMilestoneEmails,
  creators,
  follows,
  publisherOfTheWeek,
  purchaseClicks,
  users,
  wishlists,
  type CreatorType,
} from "../../db/schema";
import { getCreatorFunnelTotals } from "../book-analytics/creatorAnalytics";
import {
  buildCreatedAtFilter,
  formatMonthLabel,
  monthKeyFromRange,
  parseMonthKey,
  previousCalendarMonthRange,
  type AnalyticsDateRange,
} from "../book-analytics/dateRange";
import { getCreatorBookViewTotal } from "../book-views/services";
import { getTopBooksByViews } from "../book-views/services";
import { getTopBooksByClicks } from "../purchase-clicks/services";
import { findFollowersCount } from "../../db/queries";
import { sendEmail } from "../../lib/sendEmail";
import { err, ok, type Result } from "../../lib/result";
import { creatorProfileUrl } from "../../lib/share";
import { toUtcStartOfDay } from "../../lib/utils";
import { resolveCreatorRecipientEmail } from "./recipients";
import type {
  CreatorEmailCronOptions,
  DigestCronResult,
  DigestItemOutcome,
  EligibleCreator,
  MilestoneCronResult,
  MilestoneItemOutcome,
} from "./types";
import {
  buildAnalyticsDashboardUrl,
  buildCreatorAnalyticsHighlightEmail,
  buildCreatorAnalyticsNudgeEmail,
  buildCreatorMilestoneEmail,
  creatorAnalyticsDigestSubject,
  creatorMilestoneEmailSubject,
} from "./emails";
import {
  digestHasActivity,
  milestonesToCascadeMark,
  pickNextMilestone,
  type CreatorMilestoneKind,
} from "./milestones";

const VERIFIED_GRACE_DAYS = 30;
const SPOTLIGHT_COOLDOWN_DAYS = 7;
const MILESTONE_DIGEST_COOLDOWN_DAYS = 3;
const SEND_DELAY_MS = 400;

type ServiceError = { reason: string; cause?: unknown };

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function addUtcDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function creatorBookRoleFilter(creatorId: string, creatorType: CreatorType) {
  return creatorType === "publisher"
    ? eq(books.publisherId, creatorId)
    : eq(books.artistId, creatorId);
}

const publishedBookConditions = and(
  eq(books.publicationStatus, "published"),
  eq(books.approvalStatus, "approved"),
  or(isNull(books.releaseDate), lte(books.releaseDate, new Date())),
);

function isVerifiedLongEnough(verifiedAt: Date | null, runDate: Date): boolean {
  if (!verifiedAt) return false;
  const cutoff = addUtcDays(toUtcStartOfDay(runDate), -VERIFIED_GRACE_DAYS);
  return verifiedAt <= cutoff;
}

export async function loadEligibleCreators(
  creatorId?: string,
): Promise<Result<EligibleCreator[], ServiceError>> {
  try {
    const rows = await db
      .selectDistinct({
        id: creators.id,
        slug: creators.slug,
        displayName: creators.displayName,
        type: creators.type,
        email: creators.email,
        ownerEmail: users.email,
        verifiedAt: creators.verifiedAt,
        analyticsDigestSentForMonth: creators.analyticsDigestSentForMonth,
      })
      .from(creators)
      .innerJoin(users, eq(creators.ownerUserId, users.id))
      .innerJoin(
        books,
        or(
          and(eq(creators.type, "artist"), eq(books.artistId, creators.id)),
          and(
            eq(creators.type, "publisher"),
            eq(books.publisherId, creators.id),
          ),
        ),
      )
      .where(
        and(
          eq(creators.status, "verified"),
          isNotNull(creators.ownerUserId),
          creatorId ? eq(creators.id, creatorId) : undefined,
          publishedBookConditions,
        ),
      );

    return ok(rows);
  } catch (error) {
    console.error("loadEligibleCreators", error);
    return err({ reason: "Failed to load eligible creators", cause: error });
  }
}

export async function getCreatorNewFollowersInRange(
  creatorId: string,
  range: AnalyticsDateRange,
): Promise<number> {
  const dateFilter = buildCreatedAtFilter(follows.createdAt, range);
  const [row] = await db
    .select({ value: count() })
    .from(follows)
    .where(
      and(
        eq(follows.targetCreatorId, creatorId),
        eq(follows.targetType, "creator"),
        dateFilter,
      ),
    );
  return row?.value ?? 0;
}

async function countPublishedBooks(
  creatorId: string,
  creatorType: CreatorType,
): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(books)
    .where(
      and(
        creatorBookRoleFilter(creatorId, creatorType),
        publishedBookConditions,
      ),
    );
  return row?.value ?? 0;
}

async function getBotdFeatureInRange(
  creatorId: string,
  creatorType: CreatorType,
  range: AnalyticsDateRange,
): Promise<{ bookTitle: string; date: Date } | null> {
  const dateFilter = buildCreatedAtFilter(bookOfTheDay.date, range);
  const roleFilter = creatorBookRoleFilter(creatorId, creatorType);

  const rows = await db
    .select({
      date: bookOfTheDay.date,
      title: books.title,
    })
    .from(bookOfTheDay)
    .innerJoin(books, eq(bookOfTheDay.bookId, books.id))
    .where(and(roleFilter, dateFilter))
    .orderBy(sql`${bookOfTheDay.date} DESC`)
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  return { bookTitle: row.title, date: row.date };
}

export async function hadSpotlightFeatureEmailRecently(
  creatorId: string,
  creatorType: CreatorType,
  since: Date,
): Promise<boolean> {
  const aotw = await db.query.artistOfTheWeek.findFirst({
    where: and(
      eq(artistOfTheWeek.creatorId, creatorId),
      gte(artistOfTheWeek.featureDayEmailSentAt, since),
    ),
    columns: { id: true },
  });
  if (aotw) return true;

  const potw = await db.query.publisherOfTheWeek.findFirst({
    where: and(
      eq(publisherOfTheWeek.creatorId, creatorId),
      gte(publisherOfTheWeek.featureDayEmailSentAt, since),
    ),
    columns: { id: true },
  });
  if (potw) return true;

  const roleColumn =
    creatorType === "publisher" ? books.publisherId : books.artistId;
  const featureColumn =
    creatorType === "publisher"
      ? bookOfTheDay.publisherFeatureDayEmailSentAt
      : bookOfTheDay.artistFeatureDayEmailSentAt;

  const [botdRow] = await db
    .select({ id: bookOfTheDay.id })
    .from(bookOfTheDay)
    .innerJoin(books, eq(bookOfTheDay.bookId, books.id))
    .where(and(eq(roleColumn, creatorId), gte(featureColumn, since)))
    .limit(1);

  return Boolean(botdRow);
}

async function hadRecentMilestoneEmail(
  creatorId: string,
  since: Date,
): Promise<boolean> {
  const row = await db.query.creatorMilestoneEmails.findFirst({
    where: and(
      eq(creatorMilestoneEmails.creatorId, creatorId),
      gte(creatorMilestoneEmails.sentAt, since),
    ),
    columns: { id: true },
  });
  return Boolean(row);
}

async function gatherDigestPayload(
  creator: EligibleCreator,
  range: AnalyticsDateRange,
) {
  const scope = { creatorId: creator.id, creatorType: creator.type };
  const totals = await getCreatorFunnelTotals(scope, range);
  const newFollowers = await getCreatorNewFollowersInRange(creator.id, range);
  const publishedBookCount = await countPublishedBooks(
    creator.id,
    creator.type,
  );
  const profileUrl = creatorProfileUrl(creator.slug);
  const analyticsUrl = buildAnalyticsDashboardUrl(range);
  const monthLabel = formatMonthLabel(range);

  const [, topViewsResult] = await getTopBooksByViews(range, 1, 1, scope);
  const topBook = topViewsResult?.books[0] ?? null;
  let topBookClicks = 0;
  if (topBook) {
    const [, topClicksResult] = await getTopBooksByClicks(range, 1, 100, scope);
    const clickRow = topClicksResult?.books.find(
      (b) => b.id === topBook.bookId,
    );
    topBookClicks = clickRow?.clickCount ?? 0;
  }

  const botd = await getBotdFeatureInRange(creator.id, creator.type, range);
  const hasActivity = digestHasActivity({
    views: totals.views,
    outboundClicks: totals.outboundClicks,
    wishlists: totals.wishlists,
    collections: totals.collections,
    newFollowers,
  });

  return {
    totals,
    newFollowers,
    publishedBookCount,
    profileUrl,
    analyticsUrl,
    monthLabel,
    topBook,
    topBookClicks,
    botd,
    hasActivity,
  };
}

async function markDigestSent(creatorId: string, monthKey: string) {
  await db
    .update(creators)
    .set({ analyticsDigestSentForMonth: monthKey })
    .where(eq(creators.id, creatorId));
}

export async function runCreatorAnalyticsDigestCron(
  options: CreatorEmailCronOptions = {},
): Promise<Result<DigestCronResult, ServiceError>> {
  const runDate = options.date ?? new Date();
  if (!options.force && runDate.getUTCDate() !== 3) {
    return ok({
      action: "skipped",
      monthKey: "",
      sent: 0,
      skipped: 0,
      failed: 0,
      items: [],
    });
  }

  const range = options.month
    ? parseMonthKey(options.month)
    : previousCalendarMonthRange(runDate);
  if (!range) {
    return err({ reason: "Invalid month (use YYYY-MM)" });
  }
  const monthKey = monthKeyFromRange(range);

  const [loadError, eligible] = await loadEligibleCreators(options.creatorId);
  if (loadError) return err(loadError);

  const result: DigestCronResult = {
    action: options.dryRun ? "dry_run" : "sent",
    monthKey,
    sent: 0,
    skipped: 0,
    failed: 0,
    items: [],
  };

  const spotlightSince = addUtcDays(runDate, -SPOTLIGHT_COOLDOWN_DAYS);
  const milestoneSince = addUtcDays(runDate, -MILESTONE_DIGEST_COOLDOWN_DAYS);

  for (const creator of eligible) {
    if (!isVerifiedLongEnough(creator.verifiedAt, runDate)) {
      result.skipped++;
      result.items.push({
        creatorId: creator.id,
        outcome: { status: "skipped", reason: "not_verified_long_enough" },
      });
      continue;
    }

    if (creator.analyticsDigestSentForMonth === monthKey) {
      result.skipped++;
      result.items.push({
        creatorId: creator.id,
        outcome: { status: "skipped", reason: "already_sent" },
      });
      continue;
    }

    if (
      await hadSpotlightFeatureEmailRecently(
        creator.id,
        creator.type,
        spotlightSince,
      )
    ) {
      result.skipped++;
      result.items.push({
        creatorId: creator.id,
        outcome: { status: "skipped", reason: "recent_spotlight_email" },
      });
      continue;
    }

    const recentMilestoneEmailSent = await hadRecentMilestoneEmail(
      creator.id,
      milestoneSince,
    );

    if (recentMilestoneEmailSent) {
      result.skipped++;
      result.items.push({
        creatorId: creator.id,
        outcome: { status: "skipped", reason: "recent_milestone_email" },
      });
      continue;
    }

    const recipient =
      options.to?.trim() || resolveCreatorRecipientEmail(creator);
    if (!recipient) {
      result.skipped++;
      result.items.push({
        creatorId: creator.id,
        outcome: { status: "skipped", reason: "no_email" },
      });
      continue;
    }

    const payload = await gatherDigestPayload(creator, range);
    const template = payload.hasActivity ? "highlight" : "nudge";

    const subject = creatorAnalyticsDigestSubject({
      monthLabel: payload.monthLabel,
      template,
      topBookTitle: payload.topBook?.title ?? null,
      views: payload.totals.views,
    });

    const html =
      template === "highlight"
        ? buildCreatorAnalyticsHighlightEmail({
            displayName: creator.displayName,
            monthLabel: payload.monthLabel,
            views: payload.totals.views,
            outboundClicks: payload.totals.outboundClicks,
            wishlists: payload.totals.wishlists,
            collections: payload.totals.collections,
            newFollowers: payload.newFollowers,
            clickRate: payload.totals.clickRate,
            topBookTitle: payload.topBook?.title ?? null,
            topBookViews: payload.topBook?.viewCount ?? 0,
            topBookClicks: payload.topBookClicks,
            botdBookTitle: payload.botd?.bookTitle ?? null,
            botdDate: payload.botd?.date ?? null,
            profileUrl: payload.profileUrl,
            analyticsUrl: payload.analyticsUrl,
          })
        : buildCreatorAnalyticsNudgeEmail({
            displayName: creator.displayName,
            monthLabel: payload.monthLabel,
            publishedBookCount: payload.publishedBookCount,
            profileUrl: payload.profileUrl,
            analyticsUrl: payload.analyticsUrl,
          });

    if (options.dryRun) {
      result.items.push({
        creatorId: creator.id,
        outcome: { status: "dry_run", template, to: recipient },
      });
      continue;
    }

    const [sendError] = await sendEmail(recipient, subject, html);
    if (sendError) {
      result.failed++;
      result.items.push({
        creatorId: creator.id,
        outcome: { status: "failed", reason: sendError.reason },
      });
      continue;
    }

    await markDigestSent(creator.id, monthKey);
    result.sent++;
    result.items.push({
      creatorId: creator.id,
      outcome: { status: "sent", template, to: recipient },
    });
    await sleep(SEND_DELAY_MS);
  }

  return ok(result);
}

async function loadSentMilestones(creatorId: string): Promise<Set<string>> {
  const rows = await db.query.creatorMilestoneEmails.findMany({
    where: eq(creatorMilestoneEmails.creatorId, creatorId),
    columns: { milestone: true },
  });
  return new Set(rows.map((row) => row.milestone));
}

async function gatherMilestoneMetrics(
  creatorId: string,
  creatorType: CreatorType,
): Promise<{
  metrics: {
    hasWishlist: boolean;
    hasOutboundClick: boolean;
    followerCount: number;
    viewCount: number;
  };
  wishlistBookTitle: string | null;
  wishlistBookId: string | null;
}> {
  const roleFilter = creatorBookRoleFilter(creatorId, creatorType);

  const [wishlistRow] = await db
    .select({ title: books.title, bookId: books.id })
    .from(wishlists)
    .innerJoin(books, eq(wishlists.bookId, books.id))
    .where(and(roleFilter, publishedBookConditions))
    .orderBy(asc(wishlists.createdAt))
    .limit(1);

  const [clickRow] = await db
    .select({ id: purchaseClicks.id })
    .from(purchaseClicks)
    .innerJoin(books, eq(purchaseClicks.bookId, books.id))
    .where(and(roleFilter, publishedBookConditions))
    .limit(1);

  const followerCount = await findFollowersCount(creatorId);
  const viewCount = await getCreatorBookViewTotal(creatorId, creatorType);

  return {
    metrics: {
      hasWishlist: Boolean(wishlistRow),
      hasOutboundClick: Boolean(clickRow),
      followerCount,
      viewCount,
    },
    wishlistBookTitle: wishlistRow?.title ?? null,
    wishlistBookId: wishlistRow?.bookId ?? null,
  };
}

export async function markMilestonesSent(
  creatorId: string,
  milestones: CreatorMilestoneKind[],
  bookId?: string | null,
) {
  if (milestones.length === 0) return;
  await db
    .insert(creatorMilestoneEmails)
    .values(
      milestones.map((milestone) => ({
        creatorId,
        milestone,
        bookId: bookId ?? null,
      })),
    )
    .onConflictDoNothing({
      target: [
        creatorMilestoneEmails.creatorId,
        creatorMilestoneEmails.milestone,
      ],
    });
}

export async function runCreatorMilestoneEmailsCron(
  options: CreatorEmailCronOptions = {},
): Promise<Result<MilestoneCronResult, ServiceError>> {
  const runDate = options.date ?? new Date();

  const [loadError, eligible] = await loadEligibleCreators(options.creatorId);
  if (loadError) return err(loadError);

  const result: MilestoneCronResult = {
    action: options.dryRun ? "dry_run" : "sent",
    sent: 0,
    skipped: 0,
    failed: 0,
    items: [],
  };

  for (const creator of eligible) {
    if (!isVerifiedLongEnough(creator.verifiedAt, runDate)) {
      result.skipped++;
      result.items.push({
        creatorId: creator.id,
        outcome: { status: "skipped", reason: "not_verified_long_enough" },
      });
      continue;
    }

    const sent = await loadSentMilestones(creator.id);
    const { metrics, wishlistBookTitle, wishlistBookId } =
      await gatherMilestoneMetrics(creator.id, creator.type);
    const milestone = pickNextMilestone(sent, metrics);

    if (!milestone) {
      result.skipped++;
      result.items.push({
        creatorId: creator.id,
        outcome: { status: "skipped", reason: "no_milestone" },
      });
      continue;
    }

    const recipient =
      options.to?.trim() || resolveCreatorRecipientEmail(creator);
    if (!recipient) {
      result.skipped++;
      result.items.push({
        creatorId: creator.id,
        outcome: { status: "skipped", reason: "no_email" },
      });
      continue;
    }

    const profileUrl = creatorProfileUrl(creator.slug);
    const analyticsUrl = buildAnalyticsDashboardUrl(
      previousCalendarMonthRange(runDate),
    );
    const bookTitle = milestone === "first_wishlist" ? wishlistBookTitle : null;
    const subject = creatorMilestoneEmailSubject(milestone, bookTitle);
    const html = buildCreatorMilestoneEmail({
      displayName: creator.displayName,
      kind: milestone,
      bookTitle,
      profileUrl,
      analyticsUrl,
    });

    if (options.dryRun) {
      result.items.push({
        creatorId: creator.id,
        outcome: { status: "dry_run", milestone, to: recipient },
      });
      continue;
    }

    const [sendError] = await sendEmail(recipient, subject, html);
    if (sendError) {
      result.failed++;
      result.items.push({
        creatorId: creator.id,
        outcome: { status: "failed", reason: sendError.reason },
      });
      continue;
    }

    await markMilestonesSent(
      creator.id,
      milestonesToCascadeMark(milestone),
      milestone === "first_wishlist" ? wishlistBookId : null,
    );
    result.sent++;
    result.items.push({
      creatorId: creator.id,
      outcome: { status: "sent", milestone, to: recipient },
    });
    await sleep(SEND_DELAY_MS);
  }

  return ok(result);
}

export type { CreatorEmailCronOptions, EligibleCreator } from "./types";
export { resolveCreatorRecipientEmail } from "./recipients";
export {
  digestHasActivity,
  pickNextMilestone,
  milestonesToCascadeMark,
} from "./milestones";
