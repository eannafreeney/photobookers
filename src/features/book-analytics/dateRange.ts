import { and, gte, lt, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import {
  capEndOfDayToToday,
  formatOrdinalDate,
  parseDateString,
  toDateString,
  toUtcStartOfDay,
} from "../../lib/utils";

export type AnalyticsDateRange = {
  from: Date;
  to: Date;
};

export function presetAnalyticsDateRange(days: number): AnalyticsDateRange {
  const to = toUtcStartOfDay(new Date());
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - (days - 1));
  return { from, to };
}

export function yesterdayAnalyticsDateRange(
  referenceDate: Date = new Date(),
): AnalyticsDateRange {
  const today = toUtcStartOfDay(referenceDate);
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return { from: yesterday, to: yesterday };
}

export function parseAnalyticsDateRange(
  from?: string,
  to?: string,
): AnalyticsDateRange | null {
  if (!from?.trim() || !to?.trim()) return null;

  const fromDate = parseDateString(from.trim());
  const toDate = parseDateString(to.trim());
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return null;
  }

  const cappedTo = capEndOfDayToToday(toDate);
  const fromDay = toUtcStartOfDay(fromDate);
  const toDay = toUtcStartOfDay(cappedTo);
  if (fromDay > toDay) return null;

  return { from: fromDay, to: toDay };
}

export function formatAnalyticsDateRangeLabel(
  range: AnalyticsDateRange | null,
): string {
  if (!range) return "All time";
  if (toDateString(range.from) === toDateString(range.to)) {
    return formatOrdinalDate(range.from);
  }
  return `${formatOrdinalDate(range.from)} – ${formatOrdinalDate(range.to)}`;
}

export function analyticsSearchParams(
  range: AnalyticsDateRange | null,
  options?: { tab?: string; fragment?: string },
): string {
  const params = new URLSearchParams();
  if (range) {
    params.set("from", toDateString(range.from));
    params.set("to", toDateString(range.to));
  }
  if (options?.tab) {
    params.set("tab", options.tab);
  }
  if (options?.fragment) {
    params.set("fragment", options.fragment);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function matchesPreset(
  range: AnalyticsDateRange | null,
  days: number,
): boolean {
  if (!range) return false;
  const preset = presetAnalyticsDateRange(days);
  return (
    toDateString(range.from) === toDateString(preset.from) &&
    toDateString(range.to) === toDateString(preset.to)
  );
}

export function matchesYesterdayPreset(range: AnalyticsDateRange | null): boolean {
  if (!range) return false;
  const yesterday = yesterdayAnalyticsDateRange();
  return (
    toDateString(range.from) === toDateString(yesterday.from) &&
    toDateString(range.to) === toDateString(yesterday.to)
  );
}

function dayAfter(date: Date): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

export function buildCreatedAtFilter(
  column: PgColumn,
  range: AnalyticsDateRange | null | undefined,
): SQL | undefined {
  if (!range) return undefined;
  return and(
    gte(column, range.from),
    lt(column, dayAfter(range.to)),
  );
}

export function eachDayInRange(range: AnalyticsDateRange): string[] {
  const days: string[] = [];
  const cursor = new Date(range.from);
  const end = toUtcStartOfDay(range.to);

  while (cursor <= end) {
    days.push(toDateString(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}

/** First and last UTC day of the calendar month before referenceDate. */
export function previousCalendarMonthRange(
  referenceDate: Date = new Date(),
): AnalyticsDateRange {
  const ref = toUtcStartOfDay(referenceDate);
  const firstOfCurrentMonth = new Date(
    Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), 1),
  );
  const lastOfPreviousMonth = new Date(firstOfCurrentMonth);
  lastOfPreviousMonth.setUTCDate(0);
  const firstOfPreviousMonth = new Date(
    Date.UTC(
      lastOfPreviousMonth.getUTCFullYear(),
      lastOfPreviousMonth.getUTCMonth(),
      1,
    ),
  );
  return { from: firstOfPreviousMonth, to: lastOfPreviousMonth };
}

/** e.g. "January 2026" for a calendar-month range. */
export function formatMonthLabel(range: AnalyticsDateRange): string {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(range.from);
}

/** YYYY-MM key for digest idempotency. */
export function monthKeyFromRange(range: AnalyticsDateRange): string {
  const year = range.from.getUTCFullYear();
  const month = String(range.from.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function parseMonthKey(month: string): AnalyticsDateRange | null {
  const match = /^(\d{4})-(\d{2})$/.exec(month.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  if (monthIndex < 0 || monthIndex > 11) return null;
  const from = new Date(Date.UTC(year, monthIndex, 1));
  const to = new Date(Date.UTC(year, monthIndex + 1, 0));
  return { from, to };
}
