import { and, asc, count, eq, gte, isNotNull, isNull, lt, lte, or } from "drizzle-orm";
import { db } from "../../db/client";
import {
  books,
  creatorStubOutreachEmails,
  creators,
  type CreatorType,
} from "../../db/schema";
import { stubViewMilestoneThreshold } from "../../domain/creators/stubOutreachMilestones";
import {
  allStubViewMilestonesSent,
  getStubOutreachStats,
  hasSentAnyStubViewMilestone,
  pickNextStubViewMilestone,
} from "../../domain/creators/stubOutreachStats";
import { hadSpotlightFeatureEmailRecently } from "../creator-analytics-digest/services";
import { getCreatorBookViewTotal } from "../book-views/services";
import { sendEmail } from "../../lib/sendEmail";
import { err, ok, type Result } from "../../lib/result";
import {
  generateStubViewMilestoneEmail,
  stubViewMilestoneEmailSubject,
} from "./emails";
import type { StubOutreachCronOptions, StubOutreachCronResult } from "./types";
import { logStubOutreachEmail, sendStubWelcomeEmail } from "./welcomeEmail";
import type { StubOutreachEmailKind } from "../../db/schema";

const FIRST_ACTIVITY_GRACE_DAYS = 14;
const OUTREACH_COOLDOWN_DAYS = 7;
const SPOTLIGHT_COOLDOWN_DAYS = 7;
const SEND_DELAY_MS = 400;

type ServiceError = { reason: string; cause?: unknown };

export type EligibleStub = {
  id: string;
  slug: string;
  displayName: string;
  type: CreatorType;
  email: string | null;
  ownerUserId: string | null;
  welcomeEmailSent: Date | null;
  stubOutreachOptOutAt: Date | null;
};

const publishedBookConditions = and(
  eq(books.publicationStatus, "published"),
  eq(books.approvalStatus, "approved"),
  or(isNull(books.releaseDate), lte(books.releaseDate, new Date())),
);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function addUtcDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function startOfUtcDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function resolveDailyWelcomeLimit(
  override?: number,
): number | undefined {
  if (override !== undefined && !Number.isNaN(override) && override > 0) {
    return override;
  }
  const fromEnv = process.env.STUB_OUTREACH_DAILY_WELCOME_LIMIT;
  if (!fromEnv?.trim()) return undefined;
  const parsed = Number(fromEnv);
  return Number.isNaN(parsed) || parsed <= 0 ? undefined : parsed;
}

export async function countWelcomeEmailsSentOnDate(
  date: Date = new Date(),
): Promise<number> {
  const dayStart = startOfUtcDay(date);
  const dayEnd = addUtcDays(dayStart, 1);
  const [row] = await db
    .select({ value: count() })
    .from(creatorStubOutreachEmails)
    .where(
      and(
        eq(creatorStubOutreachEmails.kind, "welcome"),
        gte(creatorStubOutreachEmails.sentAt, dayStart),
        lt(creatorStubOutreachEmails.sentAt, dayEnd),
      ),
    );
  return Number(row?.value ?? 0);
}

function daysBetween(earlier: Date, later: Date): number {
  const ms = later.getTime() - earlier.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export async function loadEligibleStubs(
  creatorId?: string,
): Promise<Result<EligibleStub[], ServiceError>> {
  try {
    const rows = await db
      .selectDistinct({
        id: creators.id,
        slug: creators.slug,
        displayName: creators.displayName,
        type: creators.type,
        email: creators.email,
        ownerUserId: creators.ownerUserId,
        welcomeEmailSent: creators.welcomeEmailSent,
        stubOutreachOptOutAt: creators.stubOutreachOptOutAt,
      })
      .from(creators)
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
          eq(creators.status, "stub"),
          isNotNull(creators.email),
          isNull(creators.stubOutreachOptOutAt),
          creatorId ? eq(creators.id, creatorId) : undefined,
          publishedBookConditions,
        ),
      )
      .orderBy(asc(creators.displayName));

    return ok(rows);
  } catch (error) {
    console.error("loadEligibleStubs", error);
    return err({ reason: "Failed to load eligible stubs", cause: error });
  }
}

async function loadSentOutreachKinds(creatorId: string): Promise<Set<string>> {
  const rows = await db.query.creatorStubOutreachEmails.findMany({
    where: eq(creatorStubOutreachEmails.creatorId, creatorId),
    columns: { kind: true },
  });
  return new Set(rows.map((row) => row.kind));
}

async function hadRecentStubOutreach(
  creatorId: string,
  since: Date,
): Promise<boolean> {
  const row = await db.query.creatorStubOutreachEmails.findFirst({
    where: and(
      eq(creatorStubOutreachEmails.creatorId, creatorId),
      gte(creatorStubOutreachEmails.sentAt, since),
    ),
    columns: { id: true },
  });
  return Boolean(row);
}

export async function runStubOutreachCron(
  options: StubOutreachCronOptions = {},
): Promise<Result<StubOutreachCronResult, ServiceError>> {
  const runDate = options.date ?? new Date();

  const [loadError, eligible] = await loadEligibleStubs(options.creatorId);
  if (loadError) return err(loadError);

  const result: StubOutreachCronResult = {
    action: options.dryRun ? "dry_run" : "sent",
    sent: 0,
    skipped: 0,
    failed: 0,
    items: [],
  };

  const outreachSince = addUtcDays(runDate, -OUTREACH_COOLDOWN_DAYS);
  const spotlightSince = addUtcDays(runDate, -SPOTLIGHT_COOLDOWN_DAYS);
  const dailyWelcomeLimit = resolveDailyWelcomeLimit(
    options.dailyWelcomeLimit,
  );
  let welcomesSentToday = await countWelcomeEmailsSentOnDate(runDate);

  for (const stub of eligible) {
    const recipient = options.to?.trim() || stub.email?.trim();
    if (!recipient) {
      result.skipped++;
      result.items.push({
        creatorId: stub.id,
        outcome: { status: "skipped", reason: "no_email" },
      });
      continue;
    }

    if (!stub.welcomeEmailSent) {
      if (
        dailyWelcomeLimit !== undefined &&
        welcomesSentToday >= dailyWelcomeLimit &&
        !options.dryRun
      ) {
        result.skipped++;
        result.items.push({
          creatorId: stub.id,
          outcome: { status: "skipped", reason: "daily_welcome_limit" },
        });
        continue;
      }

      if (options.dryRun) {
        result.items.push({
          creatorId: stub.id,
          outcome: { status: "dry_run", kind: "welcome", to: recipient },
        });
        if (dailyWelcomeLimit !== undefined) {
          welcomesSentToday++;
        }
        continue;
      }

      const [sendError, sent] = await sendStubWelcomeEmail(stub, {
        to: options.to,
      });
      if (sendError) {
        result.failed++;
        result.items.push({
          creatorId: stub.id,
          outcome: { status: "failed", reason: sendError.reason },
        });
        continue;
      }

      welcomesSentToday++;
      result.sent++;
      result.items.push({
        creatorId: stub.id,
        outcome: { status: "sent", kind: "welcome", to: sent.to },
      });
      await sleep(SEND_DELAY_MS);
      continue;
    }

    const sent = await loadSentOutreachKinds(stub.id);
    if (allStubViewMilestonesSent(sent)) {
      result.skipped++;
      result.items.push({
        creatorId: stub.id,
        outcome: { status: "skipped", reason: "all_milestones_sent" },
      });
      continue;
    }

    if (
      !hasSentAnyStubViewMilestone(sent) &&
      daysBetween(stub.welcomeEmailSent, runDate) < FIRST_ACTIVITY_GRACE_DAYS
    ) {
      result.skipped++;
      result.items.push({
        creatorId: stub.id,
        outcome: { status: "skipped", reason: "welcome_grace_period" },
      });
      continue;
    }

    if (await hadRecentStubOutreach(stub.id, outreachSince)) {
      result.skipped++;
      result.items.push({
        creatorId: stub.id,
        outcome: { status: "skipped", reason: "recent_outreach" },
      });
      continue;
    }

    if (
      await hadSpotlightFeatureEmailRecently(stub.id, stub.type, spotlightSince)
    ) {
      result.skipped++;
      result.items.push({
        creatorId: stub.id,
        outcome: { status: "skipped", reason: "recent_spotlight_email" },
      });
      continue;
    }

    const viewCount = await getCreatorBookViewTotal(stub.id, stub.type);
    const milestone = pickNextStubViewMilestone(sent, viewCount);
    if (!milestone) {
      result.skipped++;
      result.items.push({
        creatorId: stub.id,
        outcome: {
          status: "skipped",
          reason:
            viewCount < stubViewMilestoneThreshold("views_50")
              ? "view_threshold_not_met"
              : "no_milestone",
        },
      });
      continue;
    }

    if (options.dryRun) {
      result.items.push({
        creatorId: stub.id,
        outcome: { status: "dry_run", kind: milestone, to: recipient },
      });
      continue;
    }

    const stats = await getStubOutreachStats(stub);
    const subject = stubViewMilestoneEmailSubject(milestone);
    const html = generateStubViewMilestoneEmail({
      displayName: stub.displayName,
      milestone,
      allTimeViews: viewCount,
      stats,
      profileUrl: stats.profileUrl,
      claimUrl: stats.claimUrl,
    });

    const [emailError] = await sendEmail(recipient, subject, html);
    if (emailError) {
      result.failed++;
      result.items.push({
        creatorId: stub.id,
        outcome: { status: "failed", reason: emailError.reason },
      });
      continue;
    }

    await logStubOutreachEmail(stub.id, milestone);
    result.sent++;
    result.items.push({
      creatorId: stub.id,
      outcome: {
        status: "sent",
        kind: milestone as StubOutreachEmailKind,
        to: recipient,
      },
    });
    await sleep(SEND_DELAY_MS);
  }

  return ok(result);
}
