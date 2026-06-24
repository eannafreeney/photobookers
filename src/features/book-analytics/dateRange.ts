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
