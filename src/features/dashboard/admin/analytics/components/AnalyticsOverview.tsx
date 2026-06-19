import { getBookViewTotals } from "../../../../book-views/services";
import { getPurchaseClickTotals } from "../../../../purchase-clicks/services";
import { getOverallFunnelTotals } from "../../../../book-analytics/funnel";
import {
  formatAnalyticsDateRangeLabel,
  type AnalyticsDateRange,
} from "../../../../book-analytics/dateRange";

type Props = {
  dateRange: AnalyticsDateRange | null;
};

const AnalyticsOverview = async ({ dateRange }: Props) => {
  const [viewTotals, clickTotals, funnelTotals] = await Promise.all([
    getBookViewTotals(dateRange),
    getPurchaseClickTotals(dateRange),
    getOverallFunnelTotals(dateRange),
  ]);

  const clickRateLabel =
    funnelTotals.clickRate !== null ? `${funnelTotals.clickRate}%` : "—";
  const periodLabel = formatAnalyticsDateRangeLabel(dateRange);

  return (
    <div class="flex flex-col gap-4">
      <p class="text-sm text-on-surface">
        Showing metrics for <span class="font-medium">{periodLabel}</span>
      </p>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard label="Total book views" value={viewTotals.totalViews} />
        <StatCard label="Books with views" value={viewTotals.booksWithViews} />
        <StatCard label="Total outbound clicks" value={clickTotals.totalClicks} />
        <StatCard label="Overall click rate" value={clickRateLabel} />
        <StatCard label="Total wishlists" value={funnelTotals.wishlists} />
        <StatCard label="Total collections" value={funnelTotals.collections} />
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) => (
  <div class="flex flex-col gap-2 rounded-radius border border-outline bg-surface px-4 py-3 shadow-sm">
    <p class="text-2xl font-semibold text-on-surface-strong">
      {typeof value === "number" ? value.toLocaleString() : value}
    </p>
    <p class="text-sm text-on-surface">{label}</p>
  </div>
);

export default AnalyticsOverview;
