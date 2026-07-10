import { and, asc, count, eq, gte, isNotNull, isNull, lt } from "drizzle-orm";
import { db } from "../../db/client";
import { creators, users } from "../../db/schema";
import { sendEmail } from "../../lib/sendEmail";
import { err, ok, type Result } from "../../lib/result";
import { toUtcStartOfDay } from "../../lib/utils";
import {
  buildCreatorProfileShareEmail,
  creatorProfileShareEmailSubject,
} from "./emails";
import { resolveCreatorProfileShareDailyLimit } from "./utils";

const SEND_DELAY_MS = 400;

type ServiceError = { reason: string; cause?: unknown };

export type CreatorProfileShareCronOptions = {
  dryRun?: boolean;
  to?: string;
  creatorId?: string;
  date?: Date;
  dailyLimit?: number;
};

export type CreatorProfileShareSkipReason = "no_email" | "daily_limit";

export type CreatorProfileShareItemOutcome =
  | { status: "sent"; to: string }
  | { status: "skipped"; reason: CreatorProfileShareSkipReason }
  | { status: "failed"; reason: string }
  | { status: "dry_run"; to: string };

export type CreatorProfileShareCronResult = {
  action: "sent" | "skipped" | "dry_run";
  sent: number;
  skipped: number;
  failed: number;
  items: Array<{
    id: string;
    outcome: CreatorProfileShareItemOutcome;
  }>;
};

type EligibleCreator = {
  id: string;
  displayName: string;
  slug: string;
  type: "artist" | "publisher";
  ownerEmail: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function countProfileShareEmailsSentOnDate(
  date: Date = new Date(),
): Promise<number> {
  const dayStart = toUtcStartOfDay(date);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  const [row] = await db
    .select({ value: count() })
    .from(creators)
    .where(
      and(
        isNotNull(creators.profileShareEmailSentAt),
        gte(creators.profileShareEmailSentAt, dayStart),
        lt(creators.profileShareEmailSentAt, dayEnd),
      ),
    );

  return Number(row?.value ?? 0);
}

export async function loadEligibleCreatorsForProfileShare(
  creatorId?: string,
): Promise<Result<EligibleCreator[], ServiceError>> {
  try {
    const rows = await db
      .select({
        id: creators.id,
        displayName: creators.displayName,
        slug: creators.slug,
        type: creators.type,
        ownerEmail: users.email,
      })
      .from(creators)
      .innerJoin(users, eq(creators.ownerUserId, users.id))
      .where(
        and(
          eq(creators.status, "verified"),
          isNotNull(creators.verifiedAt),
          isNull(creators.profileShareEmailSentAt),
          creatorId ? eq(creators.id, creatorId) : undefined,
        ),
      )
      .orderBy(asc(creators.verifiedAt));

    return ok(
      rows.filter(
        (row): row is EligibleCreator =>
          (row.type === "artist" || row.type === "publisher") &&
          row.ownerEmail.trim().length > 0,
      ),
    );
  } catch (error) {
    console.error("loadEligibleCreatorsForProfileShare", error);
    return err({
      reason: "Failed to load creators for profile share emails",
      cause: error,
    });
  }
}

async function markProfileShareEmailSent(
  creatorId: string,
): Promise<Result<true, ServiceError>> {
  try {
    await db
      .update(creators)
      .set({ profileShareEmailSentAt: new Date() })
      .where(eq(creators.id, creatorId));
    return ok(true);
  } catch (error) {
    return err({
      reason: "Failed to mark creator profile share email sent",
      cause: error,
    });
  }
}

export async function runCreatorProfileShareCron(
  options: CreatorProfileShareCronOptions = {},
): Promise<Result<CreatorProfileShareCronResult, ServiceError>> {
  const runDate = options.date ?? new Date();
  const targetingCreator = Boolean(options.creatorId?.trim());
  const dailyLimit = resolveCreatorProfileShareDailyLimit(options.dailyLimit);

  const [loadError, eligible] = await loadEligibleCreatorsForProfileShare(
    options.creatorId,
  );
  if (loadError) return err(loadError);

  const result: CreatorProfileShareCronResult = {
    action: options.dryRun ? "dry_run" : "sent",
    sent: 0,
    skipped: 0,
    failed: 0,
    items: [],
  };

  if (eligible.length === 0) {
    result.action = "skipped";
    return ok(result);
  }

  let remainingSlots = dailyLimit;
  if (!targetingCreator) {
    const sentToday = await countProfileShareEmailsSentOnDate(runDate);
    remainingSlots = Math.max(0, dailyLimit - sentToday);
    if (remainingSlots === 0) {
      result.action = "skipped";
      return ok(result);
    }
  }

  let sentThisRun = 0;

  for (const creator of eligible) {
    if (!targetingCreator && sentThisRun >= remainingSlots) break;

    const to = options.to?.trim() || creator.ownerEmail.trim();
    if (!to) {
      result.skipped++;
      result.items.push({
        id: creator.id,
        outcome: { status: "skipped", reason: "no_email" },
      });
      continue;
    }

    if (options.dryRun) {
      result.sent++;
      sentThisRun++;
      result.items.push({
        id: creator.id,
        outcome: { status: "dry_run", to },
      });
      continue;
    }

    const html = buildCreatorProfileShareEmail({
      displayName: creator.displayName,
      slug: creator.slug,
      type: creator.type,
    });
    const [emailError] = await sendEmail(
      to,
      creatorProfileShareEmailSubject(),
      html,
    );
    if (emailError) {
      result.failed++;
      result.items.push({
        id: creator.id,
        outcome: { status: "failed", reason: emailError.reason },
      });
      continue;
    }

    const [markError] = await markProfileShareEmailSent(creator.id);
    if (markError) return err(markError);

    result.sent++;
    sentThisRun++;
    result.items.push({
      id: creator.id,
      outcome: { status: "sent", to },
    });
    await sleep(SEND_DELAY_MS);
  }

  if (!options.dryRun && result.sent === 0 && result.failed === 0) {
    result.action = "skipped";
  }

  return ok(result);
}
