import { getBookViewTotals } from "../../../../book-views/services";
import { getOverallFunnelTotals } from "../../../../book-analytics/funnel";
import { getPurchaseClickTotals } from "../../../../purchase-clicks/services";

const AnalyticsOverview = async () => {
  const [viewTotals, clickTotals, funnelTotals] = await Promise.all([
    getBookViewTotals(),
    getPurchaseClickTotals(),
    getOverallFunnelTotals(),
  ]);

  const clickRateLabel =
    funnelTotals.clickRate !== null ? `${funnelTotals.clickRate}%` : "—";

  return (
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total book views" value={viewTotals.totalViews} />
      <StatCard label="Books with views" value={viewTotals.booksWithViews} />
      <StatCard label="Total outbound clicks" value={clickTotals.totalClicks} />
      <StatCard label="Overall click rate" value={clickRateLabel} />
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
    <p class="text-2xl font-semibold text-on-surface-strong">{value}</p>
    <p class="text-sm text-on-surface">{label}</p>
  </div>
);

export default AnalyticsOverview;
