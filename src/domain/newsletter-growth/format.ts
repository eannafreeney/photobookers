import type { AnalyticsDateRange } from "../../features/book-analytics/dateRange";
import { toUtcStartOfDay } from "../../lib/utils";

export const NEWSLETTER_GROWTH_RANGE_DAYS = 7;

export function ratePercent(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 1000) / 10;
}

export function formatRatePercent(rate: number | null): string {
  if (rate === null) return "—";
  return `${rate.toFixed(1)}%`;
}

export const SIGNUP_TARGET_MIN = 15;
export const SIGNUP_TARGET_MAX = 20;

export function newsletterGrowthRange(
  asOf: Date = new Date(),
): AnalyticsDateRange {
  const to = toUtcStartOfDay(asOf);
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - (NEWSLETTER_GROWTH_RANGE_DAYS - 1));
  return { from, to };
}
