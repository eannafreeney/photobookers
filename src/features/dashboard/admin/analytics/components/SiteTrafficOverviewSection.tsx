import {
  formatAnalyticsDateRangeLabel,
  type AnalyticsDateRange,
} from "../../../../book-analytics/dateRange";
import { formatDuration, formatEngagementRate } from "../../../../site-analytics/format";
import type { SiteTrafficDataProps } from "./siteTrafficShared";
import { AnalyticsStatCard } from "../../../components/AnalyticsStatCard";

type Props = SiteTrafficDataProps & {
  dateRange: AnalyticsDateRange | null;
};

const SiteTrafficOverviewSection = ({ data, dateRange }: Props) => {
  const { overview, usesDefaultRange } = data;
  const periodLabel = formatAnalyticsDateRangeLabel(dateRange);
  const periodCopy = usesDefaultRange
    ? "Showing Google Analytics for the last 90 days (GA4 does not support all-time queries)"
    : `Showing Google Analytics for ${periodLabel}`;

  return (
    <div class="flex flex-col gap-4">
      <p class="text-sm text-on-surface">{periodCopy}</p>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <AnalyticsStatCard label="Sessions" value={overview.sessions} />
        <AnalyticsStatCard label="Users" value={overview.totalUsers} />
        <AnalyticsStatCard label="New users" value={overview.newUsers} />
        <AnalyticsStatCard
          label="Engagement rate"
          value={formatEngagementRate(overview.engagementRate)}
        />
        <AnalyticsStatCard
          label="Avg. session duration"
          value={formatDuration(overview.averageSessionDuration)}
        />
      </div>
    </div>
  );
};

export default SiteTrafficOverviewSection;
