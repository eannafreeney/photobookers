import { count, inArray } from "drizzle-orm";
import { db } from "../../../db/client";
import { bookOfTheDay } from "../../../db/schema";
import { err, ok, type Result } from "../../../lib/result";
import { toUtcStartOfDay, toWeekStart, toWeekString } from "../../../lib/utils";
import { getWeekDays } from "../../../features/dashboard/admin/planner/utils";
import { randomizeBooksOfTheDayForWeek } from "../../../features/dashboard/admin/planner/services";

type ServiceError = { reason: string; cause?: unknown };

export type RandomizeNextWeekBotdOutcome =
  | { status: "skipped"; reason: "not_saturday" | "week_already_has_botd" }
  | { status: "scheduled"; scheduled: number }
  | { status: "failed"; reason: string }
  | { status: "dry_run"; emptyDays: number };

export type RandomizeNextWeekBotdRunResult = {
  weekStart: Date;
  weekKey: string;
  existingCount: number;
  outcome: RandomizeNextWeekBotdOutcome;
};

export type RunRandomizeNextWeekBotdOptions = {
  dryRun?: boolean;
  force?: boolean;
  /** Reference day for "this Saturday" / following-week calc (UTC). */
  date?: Date;
};

/** Monday of the week after the ISO week containing `from`. */
export function getFollowingWeekStart(from: Date = new Date()): Date {
  const currentWeekStart = toWeekStart(from);
  const next = new Date(currentWeekStart);
  next.setUTCDate(next.getUTCDate() + 7);
  return toUtcStartOfDay(next);
}

export function isSaturdayUtc(from: Date = new Date()): boolean {
  return toUtcStartOfDay(from).getUTCDay() === 6;
}

export async function runRandomizeNextWeekBotdCron(
  options: RunRandomizeNextWeekBotdOptions = {},
): Promise<Result<RandomizeNextWeekBotdRunResult, ServiceError>> {
  const { dryRun = false, force = false } = options;
  const now = options.date ?? new Date();

  if (!dryRun && !force && !isSaturdayUtc(now)) {
    const weekStart = getFollowingWeekStart(now);
    return ok({
      weekStart,
      weekKey: toWeekString(weekStart),
      existingCount: 0,
      outcome: { status: "skipped", reason: "not_saturday" },
    });
  }

  const weekStart = getFollowingWeekStart(now);
  const weekKey = toWeekString(weekStart);
  const days = getWeekDays(weekStart);

  try {
    const [{ value: existingCount = 0 }] = await db
      .select({ value: count() })
      .from(bookOfTheDay)
      .where(
        inArray(
          bookOfTheDay.date,
          days.map((day) => toUtcStartOfDay(day)),
        ),
      );

    if (existingCount > 0) {
      return ok({
        weekStart,
        weekKey,
        existingCount,
        outcome: { status: "skipped", reason: "week_already_has_botd" },
      });
    }

    if (dryRun) {
      return ok({
        weekStart,
        weekKey,
        existingCount: 0,
        outcome: { status: "dry_run", emptyDays: days.length },
      });
    }

    const [randError, randResult] =
      await randomizeBooksOfTheDayForWeek(weekStart);
    if (randError) {
      return ok({
        weekStart,
        weekKey,
        existingCount: 0,
        outcome: { status: "failed", reason: randError.reason },
      });
    }

    return ok({
      weekStart,
      weekKey,
      existingCount: 0,
      outcome: { status: "scheduled", scheduled: randResult.scheduled },
    });
  } catch (cause) {
    console.error("runRandomizeNextWeekBotdCron", cause);
    return err({
      reason: "Failed to randomize next week's Books of the Day",
      cause,
    });
  }
}
