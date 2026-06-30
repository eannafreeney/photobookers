import {
  formatAnalyticsDateRangeLabel,
  type AnalyticsDateRange,
} from "../../book-analytics/dateRange";
import {
  getCreatorFunnelTotals,
  type CreatorAnalyticsScope,
} from "../../book-analytics/creatorAnalytics";
import { getOverallFunnelTotals } from "../../book-analytics/funnel";
import { getFollowTotal } from "../../book-analytics/trends";
import { getBookViewTotals } from "../../book-views/services";
import { getCreatorViewTotals } from "../../creator-views/services";
import { getPurchaseClickTotals } from "../../purchase-clicks/services";

type Props = {
  dateRange: AnalyticsDateRange | null;
  scope?: CreatorAnalyticsScope | null;
};

const AnalyticsOverviewSection = async ({
  dateRange,
  scope = null,
}: Props) => {
  if (scope) {
    const totals = await getCreatorFunnelTotals(scope, dateRange);
    const clickRateLabel =
      totals.clickRate !== null ? `${totals.clickRate}%` : "—";
    const periodLabel = formatAnalyticsDateRangeLabel(dateRange);
    const periodCopy =
      dateRange === null
        ? "Showing all-time metrics for your books"
        : `Showing metrics for your books during ${periodLabel}`;

    return (
      <div class="flex flex-col gap-4">
        <p class="text-sm text-on-surface">{periodCopy}</p>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <StatCard label="Total book views" value={totals.views} />
          <StatCard label="Books with views" value={totals.booksWithViews} />
          <StatCard
            label="Total outbound clicks"
            value={totals.outboundClicks}
          />
          <StatCard label="Overall click rate" value={clickRateLabel} />
          <StatCard label="Total wishlists" value={totals.wishlists} />
          <StatCard label="Total collections" value={totals.collections} />
        </div>
      </div>
    );
  }

  const [viewTotals, creatorViewTotals, clickTotals, funnelTotals, followTotal] =
    await Promise.all([
      getBookViewTotals(dateRange),
      getCreatorViewTotals(dateRange),
      getPurchaseClickTotals(dateRange),
      getOverallFunnelTotals(dateRange),
      getFollowTotal(dateRange),
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
        <StatCard
          label="Publisher page views"
          value={creatorViewTotals.publisherPageViews}
        />
        <StatCard
          label="Artist page views"
          value={creatorViewTotals.artistPageViews}
        />
        <StatCard
          label="Total outbound clicks"
          value={clickTotals.totalClicks}
        />
        <StatCard label="Overall click rate" value={clickRateLabel} />
        <StatCard label="Total wishlists" value={funnelTotals.wishlists} />
        <StatCard label="Total collections" value={funnelTotals.collections} />
        <StatCard label="Total follows" value={followTotal} />
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

export default AnalyticsOverviewSection;
