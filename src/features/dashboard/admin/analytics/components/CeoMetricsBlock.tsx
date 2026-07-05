import {
  formatAnalyticsDateRangeLabel,
  type AnalyticsDateRange,
} from "../../../../book-analytics/dateRange";
import { getCeoMetricsSnapshot } from "../../../../../domain/ceo-metrics/services";
import { CeoMetricCard } from "./CeoMetricCard";

type Props = {
  dateRange: AnalyticsDateRange | null;
};

const CeoMetricsBlock = async ({ dateRange }: Props) => {
  const [error, snapshot] = await getCeoMetricsSnapshot(dateRange);

  if (error) {
    return (
      <div class="rounded-radius border border-outline bg-surface px-4 py-3 text-sm text-on-surface">
        {error.reason}
      </div>
    );
  }

  const periodLabel = formatAnalyticsDateRangeLabel(snapshot.range);
  const previousLabel = formatAnalyticsDateRangeLabel(snapshot.previousRange);
  const { breakdown } = snapshot.editorialActions;

  return (
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-2">
        <h2 class="font-display text-xl font-medium text-on-surface-strong">
          CEO overview
        </h2>
        <p class="text-sm text-on-surface">
          Showing {periodLabel}. Week-over-week compares to {previousLabel}.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CeoMetricCard
          label="Weekly active collectors"
          value={snapshot.weeklyActiveCollectors.value}
          delta={snapshot.weeklyActiveCollectors.delta}
          detail="Logged-in users who viewed, saved, followed, collected, or clicked buy."
        />
        <CeoMetricCard
          label="Editorial-attributed actions"
          value={snapshot.editorialActions.value}
          delta={snapshot.editorialActions.delta}
          detail={`${breakdown.views.toLocaleString()} editorial views · ${breakdown.clicks.toLocaleString()} editorial clicks · ${breakdown.featuredWishlists.toLocaleString()} featured-book wishlists · ${breakdown.featuredFollows.toLocaleString()} spotlight follows`}
        />
        <CeoMetricCard
          label="New discoverable releases"
          value={snapshot.supplyHealth.newReleases.value}
          delta={snapshot.supplyHealth.newReleases.delta}
          detail={`${snapshot.supplyHealth.discoverableBooks.toLocaleString()} discoverable books · ${snapshot.supplyHealth.activeCreators.toLocaleString()} active creators`}
        />
      </div>
    </div>
  );
};

export default CeoMetricsBlock;
