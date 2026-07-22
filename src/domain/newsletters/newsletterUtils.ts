import {
  formatOrdinalDate,
  toUtcStartOfDay,
  toWeekStart,
} from "../../lib/utils";

/** Newsletter is sent on Wednesday (UTC). */
export const NEWSLETTER_SEND_WEEKDAY_UTC = 3;

/** Tuesday preview test send (UTC), one day before production send. */
export const NEWSLETTER_TEST_WEEKDAY_UTC = 2;

/** Thu–Wed range ending on the send Wednesday. */
export function getNewsletterRangeForSendWednesday(sendWednesday: Date) {
  const weekEnd = toUtcStartOfDay(sendWednesday);
  const weekStart = new Date(weekEnd);
  weekStart.setUTCDate(weekStart.getUTCDate() - 6);
  return { weekStart, weekEnd };
}

export function getDaysUntilNewsletterSend(
  referenceDate: Date = new Date(),
): number {
  const day = toUtcStartOfDay(referenceDate).getUTCDay();
  if (day === NEWSLETTER_SEND_WEEKDAY_UTC) return 0;
  return (NEWSLETTER_SEND_WEEKDAY_UTC - day + 7) % 7;
}

/**
 * Books from the previous Thu through the upcoming/current send Wed (7 days).
 * On Wednesday, that Wednesday is included as the final day.
 */
export function getCurrentNewsletterRange(referenceDate: Date = new Date()) {
  const ref = toUtcStartOfDay(referenceDate);
  const sendWednesday = new Date(ref);
  sendWednesday.setUTCDate(
    sendWednesday.getUTCDate() + getDaysUntilNewsletterSend(ref),
  );
  return getNewsletterRangeForSendWednesday(sendWednesday);
}

/**
 * The Thu–Wed edition immediately after the current one. Run on Tuesday, this
 * is the "next Thu–Wed" that gets sent the following Wednesday.
 */
export function getNextNewsletterRange(referenceDate: Date = new Date()) {
  const { weekStart, weekEnd } = getCurrentNewsletterRange(referenceDate);
  const nextStart = new Date(weekStart);
  nextStart.setUTCDate(nextStart.getUTCDate() + 7);
  const nextEnd = new Date(weekEnd);
  nextEnd.setUTCDate(nextEnd.getUTCDate() + 7);
  return { weekStart: nextStart, weekEnd: nextEnd };
}

/** Newsletter range-start (Thursday) for the edition sent on this planner week's Wednesday. */
export function getNewsletterRangeStartForPlannerWeek(
  plannerMonday: Date,
): Date {
  const monday = toUtcStartOfDay(plannerMonday);
  const sendWednesday = new Date(monday);
  sendWednesday.setUTCDate(sendWednesday.getUTCDate() + 2);
  return getNewsletterRangeForSendWednesday(sendWednesday).weekStart;
}

export function isNewsletterSendDay(referenceDate: Date = new Date()): boolean {
  return (
    toUtcStartOfDay(referenceDate).getUTCDay() === NEWSLETTER_SEND_WEEKDAY_UTC
  );
}

export function isNewsletterTestDay(referenceDate: Date = new Date()): boolean {
  return (
    toUtcStartOfDay(referenceDate).getUTCDay() === NEWSLETTER_TEST_WEEKDAY_UTC
  );
}

/**
 * Map planner links, legacy Mon–Sun drafts, or any in-range date to the
 * Thursday range-start for a Thu–Wed newsletter edition.
 */
export function resolveNewsletterRangeStart(date: Date): Date {
  const d = toUtcStartOfDay(date);
  const day = d.getUTCDay();

  if (day === 4) return d;
  if (day === 1) return getNewsletterRangeStartForPlannerWeek(d);

  const daysSinceThursday = (day - 4 + 7) % 7;
  const thursday = new Date(d);
  thursday.setUTCDate(thursday.getUTCDate() - daysSinceThursday);
  return thursday;
}

const newsletterWeekdayLabel = (date: Date) =>
  date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

/** e.g. "Thu, May 29 – Wed, Jun 4" */
export function formatNewsletterWeekRange(
  weekStart: Date,
  weekEnd: Date,
): string {
  return `${newsletterWeekdayLabel(weekStart)} – ${newsletterWeekdayLabel(weekEnd)}`;
}

export function formatWeekRangeLabel(weekStart: Date, weekEnd: Date): string {
  return `${formatOrdinalDate(weekStart)} to ${formatOrdinalDate(weekEnd)}`;
}
