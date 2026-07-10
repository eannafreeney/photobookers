import { eachDayInRange, type AnalyticsDateRange } from "../../features/book-analytics/dateRange";
import { toUtcStartOfDay } from "../../lib/utils";

export type PeriodDelta = {
  diff: number;
  percent: number | null;
  label: string;
  direction: "up" | "down" | "flat";
};

export function previousPeriodRange(range: AnalyticsDateRange): AnalyticsDateRange {
  const days = eachDayInRange(range).length;
  const priorTo = new Date(range.from);
  priorTo.setUTCDate(priorTo.getUTCDate() - 1);
  const priorFrom = new Date(priorTo);
  priorFrom.setUTCDate(priorFrom.getUTCDate() - (days - 1));
  return { from: toUtcStartOfDay(priorFrom), to: toUtcStartOfDay(priorTo) };
}

export function formatPeriodDelta(
  current: number,
  previous: number,
  options?: { unitLabel?: string },
): PeriodDelta {
  const diff = current - previous;
  const unit = options?.unitLabel ?? "";
  const percent =
    previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;

  if (diff === 0) {
    return {
      diff: 0,
      percent: percent ?? 0,
      label: `No change vs prior period${unit ? ` (${unit})` : ""}`,
      direction: "flat",
    };
  }

  const sign = diff > 0 ? "+" : "";
  const pctLabel =
    percent === null
      ? previous === 0 && current > 0
        ? " (new)"
        : ""
      : ` (${sign}${percent}%)`;

  return {
    diff,
    percent,
    label: `${sign}${diff.toLocaleString()}${pctLabel} vs prior period`,
    direction: diff > 0 ? "up" : "down",
  };
}
