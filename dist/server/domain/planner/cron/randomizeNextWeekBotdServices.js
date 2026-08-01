import { count, inArray } from "drizzle-orm";
import { db } from "../../../db/client.js";
import { bookOfTheDay } from "../../../db/schema.js";
import { err, ok } from "../../../lib/result.js";
import { toUtcStartOfDay, toWeekStart, toWeekString } from "../../../lib/utils.js";
import { getWeekDays } from "../../../features/dashboard/admin/planner/utils.js";
import { randomizeBooksOfTheDayForWeek } from "../../../features/dashboard/admin/planner/services.js";
function getFollowingWeekStart(from = /* @__PURE__ */ new Date()) {
  const currentWeekStart = toWeekStart(from);
  const next = new Date(currentWeekStart);
  next.setUTCDate(next.getUTCDate() + 7);
  return toUtcStartOfDay(next);
}
function isSaturdayUtc(from = /* @__PURE__ */ new Date()) {
  return toUtcStartOfDay(from).getUTCDay() === 6;
}
async function runRandomizeNextWeekBotdCron(options = {}) {
  const { dryRun = false, force = false } = options;
  const now = options.date ?? /* @__PURE__ */ new Date();
  if (!dryRun && !force && !isSaturdayUtc(now)) {
    const weekStart2 = getFollowingWeekStart(now);
    return ok({
      weekStart: weekStart2,
      weekKey: toWeekString(weekStart2),
      existingCount: 0,
      outcome: { status: "skipped", reason: "not_saturday" }
    });
  }
  const weekStart = getFollowingWeekStart(now);
  const weekKey = toWeekString(weekStart);
  const days = getWeekDays(weekStart);
  try {
    const [{ value: existingCount = 0 }] = await db.select({ value: count() }).from(bookOfTheDay).where(
      inArray(
        bookOfTheDay.date,
        days.map((day) => toUtcStartOfDay(day))
      )
    );
    if (existingCount > 0) {
      return ok({
        weekStart,
        weekKey,
        existingCount,
        outcome: { status: "skipped", reason: "week_already_has_botd" }
      });
    }
    if (dryRun) {
      return ok({
        weekStart,
        weekKey,
        existingCount: 0,
        outcome: { status: "dry_run", emptyDays: days.length }
      });
    }
    const [randError, randResult] = await randomizeBooksOfTheDayForWeek(weekStart);
    if (randError) {
      return ok({
        weekStart,
        weekKey,
        existingCount: 0,
        outcome: { status: "failed", reason: randError.reason }
      });
    }
    return ok({
      weekStart,
      weekKey,
      existingCount: 0,
      outcome: { status: "scheduled", scheduled: randResult.scheduled }
    });
  } catch (cause) {
    console.error("runRandomizeNextWeekBotdCron", cause);
    return err({
      reason: "Failed to randomize next week's Books of the Day",
      cause
    });
  }
}
export {
  getFollowingWeekStart,
  isSaturdayUtc,
  runRandomizeNextWeekBotdCron
};
