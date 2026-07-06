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
  sql
} from "drizzle-orm";
import { db } from "../../db/client.js";
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
  wishlists
} from "../../db/schema.js";
import { getCreatorFunnelTotals } from "../book-analytics/creatorAnalytics.js";
import {
  buildCreatedAtFilter,
  formatMonthLabel,
  monthKeyFromRange,
  parseMonthKey,
  previousCalendarMonthRange
} from "../book-analytics/dateRange.js";
import { getCreatorBookViewTotal } from "../book-views/services.js";
import { getCreatorProfileViewTotal } from "../creator-views/services.js";
import { getTopBooksByViews } from "../book-views/services.js";
import { getTopBooksByClicks } from "../purchase-clicks/services.js";
import { findFollowersCount } from "../../db/queries.js";
import { sendEmail } from "../../lib/sendEmail.js";
import { err, ok } from "../../lib/result.js";
import { creatorProfileUrl } from "../../lib/share.js";
import { toUtcStartOfDay } from "../../lib/utils.js";
import { resolveCreatorRecipientEmail } from "./recipients.js";
import {
  buildAnalyticsDashboardUrl,
  buildCreatorAnalyticsHighlightEmail,
  buildCreatorAnalyticsNudgeEmail,
  buildCreatorMilestoneEmail,
  creatorAnalyticsDigestSubject,
  creatorMilestoneEmailSubject
} from "./emails.js";
import {
  digestHasActivity,
  milestonesToCascadeMark,
  pickNextMilestone
} from "./milestones.js";
const VERIFIED_GRACE_DAYS = 30;
const SPOTLIGHT_COOLDOWN_DAYS = 7;
const MILESTONE_DIGEST_COOLDOWN_DAYS = 3;
const SEND_DELAY_MS = 400;
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function addUtcDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}
function creatorBookRoleFilter(creatorId, creatorType) {
  return creatorType === "publisher" ? eq(books.publisherId, creatorId) : eq(books.artistId, creatorId);
}
const publishedBookConditions = and(
  eq(books.publicationStatus, "published"),
  eq(books.approvalStatus, "approved"),
  or(isNull(books.releaseDate), lte(books.releaseDate, /* @__PURE__ */ new Date()))
);
function isVerifiedLongEnough(verifiedAt, runDate) {
  if (!verifiedAt) return false;
  const cutoff = addUtcDays(toUtcStartOfDay(runDate), -VERIFIED_GRACE_DAYS);
  return verifiedAt <= cutoff;
}
async function loadEligibleCreators(creatorId) {
  try {
    const rows = await db.selectDistinct({
      id: creators.id,
      slug: creators.slug,
      displayName: creators.displayName,
      type: creators.type,
      email: creators.email,
      ownerEmail: users.email,
      verifiedAt: creators.verifiedAt,
      analyticsDigestSentForMonth: creators.analyticsDigestSentForMonth
    }).from(creators).innerJoin(users, eq(creators.ownerUserId, users.id)).innerJoin(
      books,
      or(
        and(eq(creators.type, "artist"), eq(books.artistId, creators.id)),
        and(
          eq(creators.type, "publisher"),
          eq(books.publisherId, creators.id)
        )
      )
    ).where(
      and(
        eq(creators.status, "verified"),
        isNotNull(creators.ownerUserId),
        creatorId ? eq(creators.id, creatorId) : void 0,
        publishedBookConditions
      )
    );
    return ok(rows);
  } catch (error) {
    console.error("loadEligibleCreators", error);
    return err({ reason: "Failed to load eligible creators", cause: error });
  }
}
async function getCreatorNewFollowersInRange(creatorId, range) {
  const dateFilter = buildCreatedAtFilter(follows.createdAt, range);
  const [row] = await db.select({ value: count() }).from(follows).where(
    and(
      eq(follows.targetCreatorId, creatorId),
      eq(follows.targetType, "creator"),
      dateFilter
    )
  );
  return row?.value ?? 0;
}
async function countPublishedBooks(creatorId, creatorType) {
  const [row] = await db.select({ value: count() }).from(books).where(
    and(
      creatorBookRoleFilter(creatorId, creatorType),
      publishedBookConditions
    )
  );
  return row?.value ?? 0;
}
async function getBotdFeatureInRange(creatorId, creatorType, range) {
  const dateFilter = buildCreatedAtFilter(bookOfTheDay.date, range);
  const roleFilter = creatorBookRoleFilter(creatorId, creatorType);
  const rows = await db.select({
    date: bookOfTheDay.date,
    title: books.title
  }).from(bookOfTheDay).innerJoin(books, eq(bookOfTheDay.bookId, books.id)).where(and(roleFilter, dateFilter)).orderBy(sql`${bookOfTheDay.date} DESC`).limit(1);
  const row = rows[0];
  if (!row) return null;
  return { bookTitle: row.title, date: row.date };
}
async function hadSpotlightFeatureEmailRecently(creatorId, creatorType, since) {
  const aotw = await db.query.artistOfTheWeek.findFirst({
    where: and(
      eq(artistOfTheWeek.creatorId, creatorId),
      gte(artistOfTheWeek.featureDayEmailSentAt, since)
    ),
    columns: { id: true }
  });
  if (aotw) return true;
  const potw = await db.query.publisherOfTheWeek.findFirst({
    where: and(
      eq(publisherOfTheWeek.creatorId, creatorId),
      gte(publisherOfTheWeek.featureDayEmailSentAt, since)
    ),
    columns: { id: true }
  });
  if (potw) return true;
  const roleColumn = creatorType === "publisher" ? books.publisherId : books.artistId;
  const featureColumn = creatorType === "publisher" ? bookOfTheDay.publisherFeatureDayEmailSentAt : bookOfTheDay.artistFeatureDayEmailSentAt;
  const [botdRow] = await db.select({ id: bookOfTheDay.id }).from(bookOfTheDay).innerJoin(books, eq(bookOfTheDay.bookId, books.id)).where(and(eq(roleColumn, creatorId), gte(featureColumn, since))).limit(1);
  return Boolean(botdRow);
}
async function hadRecentMilestoneEmail(creatorId, since) {
  const row = await db.query.creatorMilestoneEmails.findFirst({
    where: and(
      eq(creatorMilestoneEmails.creatorId, creatorId),
      gte(creatorMilestoneEmails.sentAt, since)
    ),
    columns: { id: true }
  });
  return Boolean(row);
}
async function gatherDigestPayload(creator, range) {
  const scope = { creatorId: creator.id, creatorType: creator.type };
  const totals = await getCreatorFunnelTotals(scope, range);
  const newFollowers = await getCreatorNewFollowersInRange(creator.id, range);
  const publishedBookCount = await countPublishedBooks(
    creator.id,
    creator.type
  );
  const profileUrl = creatorProfileUrl(creator.slug);
  const analyticsUrl = buildAnalyticsDashboardUrl(range);
  const monthLabel = formatMonthLabel(range);
  const topBookLimit = Math.min(3, publishedBookCount);
  const [, topViewsResult] = await getTopBooksByViews(
    range,
    1,
    topBookLimit,
    scope
  );
  const topBooksWithViews = topViewsResult?.books.filter((book) => book.viewCount > 0) ?? [];
  let topBooks = [];
  if (topBooksWithViews.length > 0) {
    const [, topClicksResult] = await getTopBooksByClicks(range, 1, 100, scope);
    const clickByBookId = new Map(
      topClicksResult?.books.map((book) => [book.id, book.clickCount]) ?? []
    );
    topBooks = topBooksWithViews.map((book) => ({
      title: book.title,
      views: book.viewCount,
      clicks: clickByBookId.get(book.bookId) ?? 0
    }));
  }
  const botd = await getBotdFeatureInRange(creator.id, creator.type, range);
  const hasActivity = digestHasActivity({
    views: totals.views,
    outboundClicks: totals.outboundClicks,
    favorites: totals.favorites,
    newFollowers
  });
  return {
    totals,
    newFollowers,
    publishedBookCount,
    profileUrl,
    analyticsUrl,
    monthLabel,
    topBooks,
    botd,
    hasActivity
  };
}
async function markDigestSent(creatorId, monthKey) {
  await db.update(creators).set({ analyticsDigestSentForMonth: monthKey }).where(eq(creators.id, creatorId));
}
async function runCreatorAnalyticsDigestCron(options = {}) {
  const runDate = options.date ?? /* @__PURE__ */ new Date();
  if (!options.force && runDate.getUTCDate() !== 3) {
    return ok({
      action: "skipped",
      monthKey: "",
      sent: 0,
      skipped: 0,
      failed: 0,
      items: []
    });
  }
  const range = options.month ? parseMonthKey(options.month) : previousCalendarMonthRange(runDate);
  if (!range) {
    return err({ reason: "Invalid month (use YYYY-MM)" });
  }
  const monthKey = monthKeyFromRange(range);
  const [loadError, eligible] = await loadEligibleCreators(options.creatorId);
  if (loadError) return err(loadError);
  const result = {
    action: options.dryRun ? "dry_run" : "sent",
    monthKey,
    sent: 0,
    skipped: 0,
    failed: 0,
    items: []
  };
  const spotlightSince = addUtcDays(runDate, -SPOTLIGHT_COOLDOWN_DAYS);
  const milestoneSince = addUtcDays(runDate, -MILESTONE_DIGEST_COOLDOWN_DAYS);
  for (const creator of eligible) {
    if (!isVerifiedLongEnough(creator.verifiedAt, runDate)) {
      result.skipped++;
      result.items.push({
        creatorId: creator.id,
        outcome: { status: "skipped", reason: "not_verified_long_enough" }
      });
      continue;
    }
    if (creator.analyticsDigestSentForMonth === monthKey) {
      result.skipped++;
      result.items.push({
        creatorId: creator.id,
        outcome: { status: "skipped", reason: "already_sent" }
      });
      continue;
    }
    if (await hadSpotlightFeatureEmailRecently(
      creator.id,
      creator.type,
      spotlightSince
    )) {
      result.skipped++;
      result.items.push({
        creatorId: creator.id,
        outcome: { status: "skipped", reason: "recent_spotlight_email" }
      });
      continue;
    }
    const recentMilestoneEmailSent = await hadRecentMilestoneEmail(
      creator.id,
      milestoneSince
    );
    if (recentMilestoneEmailSent) {
      result.skipped++;
      result.items.push({
        creatorId: creator.id,
        outcome: { status: "skipped", reason: "recent_milestone_email" }
      });
      continue;
    }
    const recipient = options.to?.trim() || resolveCreatorRecipientEmail(creator);
    if (!recipient) {
      result.skipped++;
      result.items.push({
        creatorId: creator.id,
        outcome: { status: "skipped", reason: "no_email" }
      });
      continue;
    }
    const payload = await gatherDigestPayload(creator, range);
    const template = payload.hasActivity ? "highlight" : "nudge";
    const subject = creatorAnalyticsDigestSubject({
      monthLabel: payload.monthLabel,
      template,
      topBookTitle: payload.topBooks[0]?.title ?? null,
      views: payload.totals.views
    });
    const html = template === "highlight" ? buildCreatorAnalyticsHighlightEmail({
      displayName: creator.displayName,
      monthLabel: payload.monthLabel,
      views: payload.totals.views,
      outboundClicks: payload.totals.outboundClicks,
      favorites: payload.totals.favorites,
      newFollowers: payload.newFollowers,
      clickRate: payload.totals.clickRate,
      topBooks: payload.topBooks,
      botdBookTitle: payload.botd?.bookTitle ?? null,
      botdDate: payload.botd?.date ?? null,
      profileUrl: payload.profileUrl,
      analyticsUrl: payload.analyticsUrl
    }) : buildCreatorAnalyticsNudgeEmail({
      displayName: creator.displayName,
      monthLabel: payload.monthLabel,
      publishedBookCount: payload.publishedBookCount,
      profileUrl: payload.profileUrl,
      analyticsUrl: payload.analyticsUrl
    });
    if (options.dryRun) {
      result.items.push({
        creatorId: creator.id,
        outcome: { status: "dry_run", template, to: recipient }
      });
      continue;
    }
    const [sendError] = await sendEmail(recipient, subject, html);
    if (sendError) {
      result.failed++;
      result.items.push({
        creatorId: creator.id,
        outcome: { status: "failed", reason: sendError.reason }
      });
      continue;
    }
    await markDigestSent(creator.id, monthKey);
    result.sent++;
    result.items.push({
      creatorId: creator.id,
      outcome: { status: "sent", template, to: recipient }
    });
    await sleep(SEND_DELAY_MS);
  }
  return ok(result);
}
async function loadSentMilestones(creatorId) {
  const rows = await db.query.creatorMilestoneEmails.findMany({
    where: eq(creatorMilestoneEmails.creatorId, creatorId),
    columns: { milestone: true }
  });
  return new Set(rows.map((row) => row.milestone));
}
async function gatherMilestoneMetrics(creatorId, creatorType) {
  const roleFilter = creatorBookRoleFilter(creatorId, creatorType);
  const [wishlistRow] = await db.select({ title: books.title, bookId: books.id }).from(wishlists).innerJoin(books, eq(wishlists.bookId, books.id)).where(and(roleFilter, publishedBookConditions)).orderBy(asc(wishlists.createdAt)).limit(1);
  const [clickRow] = await db.select({ id: purchaseClicks.id }).from(purchaseClicks).innerJoin(books, eq(purchaseClicks.bookId, books.id)).where(and(roleFilter, publishedBookConditions)).limit(1);
  const followerCount = await findFollowersCount(creatorId);
  const [viewCount, profileViewCount] = await Promise.all([
    getCreatorBookViewTotal(creatorId, creatorType),
    getCreatorProfileViewTotal(creatorId)
  ]);
  return {
    metrics: {
      hasWishlist: Boolean(wishlistRow),
      hasOutboundClick: Boolean(clickRow),
      followerCount,
      profileViewCount,
      viewCount
    },
    wishlistBookTitle: wishlistRow?.title ?? null,
    wishlistBookId: wishlistRow?.bookId ?? null
  };
}
async function markMilestonesSent(creatorId, milestones, bookId) {
  if (milestones.length === 0) return;
  await db.insert(creatorMilestoneEmails).values(
    milestones.map((milestone) => ({
      creatorId,
      milestone,
      bookId: bookId ?? null
    }))
  ).onConflictDoNothing({
    target: [
      creatorMilestoneEmails.creatorId,
      creatorMilestoneEmails.milestone
    ]
  });
}
async function runCreatorMilestoneEmailsCron(options = {}) {
  const runDate = options.date ?? /* @__PURE__ */ new Date();
  const [loadError, eligible] = await loadEligibleCreators(options.creatorId);
  if (loadError) return err(loadError);
  const result = {
    action: options.dryRun ? "dry_run" : "sent",
    sent: 0,
    skipped: 0,
    failed: 0,
    items: []
  };
  for (const creator of eligible) {
    if (!isVerifiedLongEnough(creator.verifiedAt, runDate)) {
      result.skipped++;
      result.items.push({
        creatorId: creator.id,
        outcome: { status: "skipped", reason: "not_verified_long_enough" }
      });
      continue;
    }
    const sent = await loadSentMilestones(creator.id);
    const { metrics, wishlistBookTitle, wishlistBookId } = await gatherMilestoneMetrics(creator.id, creator.type);
    const milestone = pickNextMilestone(sent, metrics);
    if (!milestone) {
      result.skipped++;
      result.items.push({
        creatorId: creator.id,
        outcome: { status: "skipped", reason: "no_milestone" }
      });
      continue;
    }
    const recipient = options.to?.trim() || resolveCreatorRecipientEmail(creator);
    if (!recipient) {
      result.skipped++;
      result.items.push({
        creatorId: creator.id,
        outcome: { status: "skipped", reason: "no_email" }
      });
      continue;
    }
    const profileUrl = creatorProfileUrl(creator.slug);
    const analyticsUrl = buildAnalyticsDashboardUrl(
      previousCalendarMonthRange(runDate)
    );
    const bookTitle = milestone === "first_wishlist" ? wishlistBookTitle : null;
    const subject = creatorMilestoneEmailSubject(milestone, bookTitle);
    const html = buildCreatorMilestoneEmail({
      displayName: creator.displayName,
      kind: milestone,
      bookTitle,
      profileUrl,
      analyticsUrl
    });
    if (options.dryRun) {
      result.items.push({
        creatorId: creator.id,
        outcome: { status: "dry_run", milestone, to: recipient }
      });
      continue;
    }
    const [sendError] = await sendEmail(recipient, subject, html);
    if (sendError) {
      result.failed++;
      result.items.push({
        creatorId: creator.id,
        outcome: { status: "failed", reason: sendError.reason }
      });
      continue;
    }
    await markMilestonesSent(
      creator.id,
      milestonesToCascadeMark(milestone),
      milestone === "first_wishlist" ? wishlistBookId : null
    );
    result.sent++;
    result.items.push({
      creatorId: creator.id,
      outcome: { status: "sent", milestone, to: recipient }
    });
    await sleep(SEND_DELAY_MS);
  }
  return ok(result);
}
import { resolveCreatorRecipientEmail as resolveCreatorRecipientEmail2 } from "./recipients.js";
import {
  digestHasActivity as digestHasActivity2,
  pickNextMilestone as pickNextMilestone2,
  milestonesToCascadeMark as milestonesToCascadeMark2
} from "./milestones.js";
export {
  digestHasActivity2 as digestHasActivity,
  getCreatorNewFollowersInRange,
  hadSpotlightFeatureEmailRecently,
  loadEligibleCreators,
  markMilestonesSent,
  milestonesToCascadeMark2 as milestonesToCascadeMark,
  pickNextMilestone2 as pickNextMilestone,
  resolveCreatorRecipientEmail2 as resolveCreatorRecipientEmail,
  runCreatorAnalyticsDigestCron,
  runCreatorMilestoneEmailsCron
};
