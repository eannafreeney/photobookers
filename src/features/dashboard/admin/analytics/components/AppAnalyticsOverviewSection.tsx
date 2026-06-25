import {
  formatAnalyticsDateRangeLabel,
  type AnalyticsDateRange,
} from "../../../../book-analytics/dateRange";
import { AnalyticsStatCard } from "../../../components/AnalyticsStatCard";
import type { AppAnalyticsDataProps } from "./appAnalyticsShared";

type Props = AppAnalyticsDataProps & {
  dateRange: AnalyticsDateRange | null;
};

const AppAnalyticsOverviewSection = ({ data, dateRange }: Props) => {
  const { overview, usesDefaultRange } = data;
  const periodLabel = formatAnalyticsDateRangeLabel(dateRange);
  const periodCopy = usesDefaultRange
    ? "Showing App Store downloads for the last 30 days"
    : `Showing App Store downloads for ${periodLabel}`;

  return (
    <div class="flex flex-col gap-4">
      <p class="text-sm text-on-surface">{periodCopy}</p>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnalyticsStatCard label="Total downloads" value={overview.downloads} />
        <AnalyticsStatCard
          label="First-time downloads"
          value={overview.firstTimeDownloads}
        />
        <AnalyticsStatCard label="Redownloads" value={overview.redownloads} />
      </div>
    </div>
  );
};

export default AppAnalyticsOverviewSection;
