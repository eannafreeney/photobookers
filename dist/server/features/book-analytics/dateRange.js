import { and, gte, lt } from "drizzle-orm";
import {
  capEndOfDayToToday,
  formatOrdinalDate,
  parseDateString,
  toDateString,
  toUtcStartOfDay
} from "../../lib/utils.js";
function presetAnalyticsDateRange(days) {
  const to = toUtcStartOfDay(/* @__PURE__ */ new Date());
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - (days - 1));
  return { from, to };
}
function yesterdayAnalyticsDateRange(referenceDate = /* @__PURE__ */ new Date()) {
  const today = toUtcStartOfDay(referenceDate);
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return { from: yesterday, to: yesterday };
}
function parseAnalyticsDateRange(from, to) {
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
function formatAnalyticsDateRangeLabel(range) {
  if (!range) return "All time";
  if (toDateString(range.from) === toDateString(range.to)) {
    return formatOrdinalDate(range.from);
  }
  return `${formatOrdinalDate(range.from)} \u2013 ${formatOrdinalDate(range.to)}`;
}
function analyticsSearchParams(range, options) {
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
function matchesPreset(range, days) {
  if (!range) return false;
  const preset = presetAnalyticsDateRange(days);
  return toDateString(range.from) === toDateString(preset.from) && toDateString(range.to) === toDateString(preset.to);
}
function matchesYesterdayPreset(range) {
  if (!range) return false;
  const yesterday = yesterdayAnalyticsDateRange();
  return toDateString(range.from) === toDateString(yesterday.from) && toDateString(range.to) === toDateString(yesterday.to);
}
function dayAfter(date) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + 1);
  return next;
}
function buildCreatedAtFilter(column, range) {
  if (!range) return void 0;
  return and(
    gte(column, range.from),
    lt(column, dayAfter(range.to))
  );
}
function eachDayInRange(range) {
  const days = [];
  const cursor = new Date(range.from);
  const end = toUtcStartOfDay(range.to);
  while (cursor <= end) {
    days.push(toDateString(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}
function previousCalendarMonthRange(referenceDate = /* @__PURE__ */ new Date()) {
  const ref = toUtcStartOfDay(referenceDate);
  const firstOfCurrentMonth = new Date(
    Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), 1)
  );
  const lastOfPreviousMonth = new Date(firstOfCurrentMonth);
  lastOfPreviousMonth.setUTCDate(0);
  const firstOfPreviousMonth = new Date(
    Date.UTC(
      lastOfPreviousMonth.getUTCFullYear(),
      lastOfPreviousMonth.getUTCMonth(),
      1
    )
  );
  return { from: firstOfPreviousMonth, to: lastOfPreviousMonth };
}
function formatMonthLabel(range) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(range.from);
}
function monthKeyFromRange(range) {
  const year = range.from.getUTCFullYear();
  const month = String(range.from.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}
function parseMonthKey(month) {
  const match = /^(\d{4})-(\d{2})$/.exec(month.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  if (monthIndex < 0 || monthIndex > 11) return null;
  const from = new Date(Date.UTC(year, monthIndex, 1));
  const to = new Date(Date.UTC(year, monthIndex + 1, 0));
  return { from, to };
}
export {
  analyticsSearchParams,
  buildCreatedAtFilter,
  eachDayInRange,
  formatAnalyticsDateRangeLabel,
  formatMonthLabel,
  matchesPreset,
  matchesYesterdayPreset,
  monthKeyFromRange,
  parseAnalyticsDateRange,
  parseMonthKey,
  presetAnalyticsDateRange,
  previousCalendarMonthRange,
  yesterdayAnalyticsDateRange
};
