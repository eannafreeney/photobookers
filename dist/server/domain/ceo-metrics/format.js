import { eachDayInRange } from "../../features/book-analytics/dateRange.js";
import { toUtcStartOfDay } from "../../lib/utils.js";
function isMondayUtc(date = /* @__PURE__ */ new Date()) {
  return toUtcStartOfDay(date).getUTCDay() === 1;
}
function previousPeriodRange(range) {
  const days = eachDayInRange(range).length;
  const priorTo = new Date(range.from);
  priorTo.setUTCDate(priorTo.getUTCDate() - 1);
  const priorFrom = new Date(priorTo);
  priorFrom.setUTCDate(priorFrom.getUTCDate() - (days - 1));
  return { from: toUtcStartOfDay(priorFrom), to: toUtcStartOfDay(priorTo) };
}
function formatPeriodDelta(current, previous, options) {
  const diff = current - previous;
  const unit = options?.unitLabel ?? "";
  const percent = previous > 0 ? Math.round((current - previous) / previous * 100) : null;
  if (diff === 0) {
    return {
      diff: 0,
      percent: percent ?? 0,
      label: `No change vs prior period${unit ? ` (${unit})` : ""}`,
      direction: "flat"
    };
  }
  const sign = diff > 0 ? "+" : "";
  const pctLabel = percent === null ? previous === 0 && current > 0 ? " (new)" : "" : ` (${sign}${percent}%)`;
  return {
    diff,
    percent,
    label: `${sign}${diff.toLocaleString()}${pctLabel} vs prior period`,
    direction: diff > 0 ? "up" : "down"
  };
}
export {
  formatPeriodDelta,
  isMondayUtc,
  previousPeriodRange
};
