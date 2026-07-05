import type { AnalyticsDateRange } from "../../features/book-analytics/dateRange";
import type { PeriodDelta } from "./format";

export type CeoMetricWithDelta = {
  value: number;
  delta: PeriodDelta;
};

export type EditorialActionBreakdown = {
  views: number;
  clicks: number;
  featuredWishlists: number;
  featuredFollows: number;
};

export type SupplyHealthMetrics = {
  discoverableBooks: number;
  activeCreators: number;
  newReleases: CeoMetricWithDelta;
};

export type CeoMetricsSnapshot = {
  range: AnalyticsDateRange;
  previousRange: AnalyticsDateRange;
  weeklyActiveCollectors: CeoMetricWithDelta;
  editorialActions: CeoMetricWithDelta & {
    breakdown: EditorialActionBreakdown;
  };
  supplyHealth: SupplyHealthMetrics;
};
