import {
  parseWeekString,
  toUtcStartOfDay,
  toWeekStart,
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

/** Long BOTD date for emails, e.g. "Monday, June 1, 2026". */
export function formatBotdDateLong(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
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

export function addUtcDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/** BOTD advance emails send on the day that is 7 days before feature day. */
export function getBotdAdvanceEmailScheduledDate(featureDate: Date): Date {
  return addUtcDays(toUtcStartOfDay(featureDate), -7);
}

/** BOTD feature-day emails send on the feature day. */
export function getBotdFeatureDayEmailScheduledDate(featureDate: Date): Date {
  return toUtcStartOfDay(featureDate);
}

/** Spotlight advance / interview-reminder emails send 7 days before week start. */
export function getSpotlightAdvanceEmailScheduledDate(weekStart: Date): Date {
  return addUtcDays(toWeekStart(weekStart), -7);
}

/** Spotlight feature-day emails send on the Monday that starts the feature week. */
export function getSpotlightFeatureDayEmailScheduledDate(weekStart: Date): Date {
  return toWeekStart(weekStart);
}

/** Admin Instagram prep reminder emails send two days before week start (Saturday). */
export function getInstagramPrepReminderScheduledDate(weekStart: Date): Date {
  return addUtcDays(toWeekStart(weekStart), -2);
}

/** Content preview email sends three days before ISO week start (Friday before Monday week). */
export function getContentPreviewEmailScheduledDate(weekStart: Date): Date {
  return addUtcDays(toWeekStart(weekStart), -3);
}

/** Week start to prep when the cron runs on `asOf`, or null if not reminder day. */
export function getContentPreviewWeekStartForDate(asOf: Date): Date | null {
  const today = toUtcStartOfDay(asOf);
  const weekStart = addUtcDays(today, 3);
  if (weekStart.getUTCDay() !== 1) return null;
  return toWeekStart(weekStart);
}

/** Week start to check when the cron runs on `asOf`, or null if not reminder day. */
export function getInstagramPrepReminderWeekStart(asOf: Date): Date | null {
  const today = toUtcStartOfDay(asOf);
  const weekStart = addUtcDays(today, 2);
  if (weekStart.getUTCDay() !== 1) return null;
  return toWeekStart(weekStart);
}

export type EmailSendStatus =
  | "sent"
  | "pending"
  | "today"
  | "overdue"
  | "blocked";

export function getEmailSendStatus(params: {
  sentAt: Date | null;
  scheduledDate: Date;
  hasEmail: boolean;
  now?: Date;
}): EmailSendStatus {
  if (params.sentAt) return "sent";
  if (!params.hasEmail) return "blocked";

  const today = toUtcStartOfDay(params.now ?? new Date());
  const scheduled = toUtcStartOfDay(params.scheduledDate);

  if (scheduled.getTime() < today.getTime()) return "overdue";
  if (scheduled.getTime() === today.getTime()) return "today";
  return "pending";
}
