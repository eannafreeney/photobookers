import {
  parseWeekString,
  toUtcStartOfDay,
  toWeekString,
} from "../../../../lib/utils";

/** All ISO week-start dates (Mondays) for a given year. Returns 52 or 53 dates. */
export function getWeekStarts(year: number): Date[] {
  const firstMonday = parseWeekString(`${year}-W01`);
  const weekStarts: Date[] = [];
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  for (let k = 0; k < 53; k++) {
    const d = new Date(firstMonday.getTime() + k * msPerWeek);
    if (toWeekString(d).startsWith(`${year}-`)) {
      weekStarts.push(d);
    }
  }
  return weekStarts;
}

/** All seven UTC days of an ISO week starting at the given Monday. */
export function getWeekDays(weekStart: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setUTCDate(d.getUTCDate() + i);
    days.push(d);
  }
  return days;
}

/** Format a single day for planner display, e.g. "Mon Aug 12". */
export function formatDayLabel(d: Date): string {
  const weekday = d.toLocaleString("en-US", {
    weekday: "short",
    timeZone: "UTC",
  });
  const month = d.toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  return `${weekday} ${month} ${d.getUTCDate()}`;
}

/** Format a single day's short weekday label, e.g. "Mon". */
export function formatDayWeekday(d: Date): string {
  return d.toLocaleString("en-US", { weekday: "short", timeZone: "UTC" });
}

/** True if the given UTC date is strictly before today (UTC). */
export function isDayInPast(date: Date): boolean {
  const today = toUtcStartOfDay(new Date());
  return toUtcStartOfDay(date).getTime() < today.getTime();
}

/** Format a week as "Mon DD – Sun DD, YYYY" for planner display */
export function formatWeekRange(weekStart: Date): string {
  const start = new Date(weekStart);
  const end = new Date(weekStart);
  end.setUTCDate(end.getUTCDate() + 6);
  const monthStart = start.toLocaleString("en-US", { month: "short" });
  const monthEnd = end.toLocaleString("en-US", { month: "short" });
  const dayStart = start.getUTCDate();
  const dayEnd = end.getUTCDate();
  const year = end.getUTCFullYear();
  if (monthStart === monthEnd) {
    return `${monthStart} ${dayStart}–${dayEnd}, ${year}`;
  }
  return `${monthStart} ${dayStart} – ${monthEnd} ${dayEnd}, ${year}`;
}

/** Get ISO week number (1–53) from a week-start Date */
export function getWeekNumber(weekStart: Date): number {
  const d = new Date(weekStart);
  d.setUTCDate(d.getUTCDate() + 3);
  const jan1 = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return (
    1 +
    Math.ceil(
      (d.getTime() - jan1.getTime()) / (7 * 24 * 60 * 60 * 1000) -
        ((jan1.getUTCDay() + 6) % 7) / 7,
    )
  );
}

export function isWeekInPast(weekStart: Date): boolean {
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const day = today.getUTCDay();
  const daysToMonday = day === 0 ? 6 : day - 1;
  today.setUTCDate(today.getUTCDate() - daysToMonday);
  return weekStart.getTime() < today.getTime();
}
