import SectionTitle from "../../../../../components/app/SectionTitle";
import { getSourceTotals } from "../../../../book-analytics/trends";
import type { AnalyticsDateRange } from "../../../../book-analytics/dateRange";

type Props = {
  dateRange: AnalyticsDateRange | null;
};

const AnalyticsSourceBreakdown = async ({ dateRange }: Props) => {
  const totals = await getSourceTotals(dateRange);

  return (
    <div class="flex flex-col gap-4">
      <SectionTitle>Web vs Hyperview</SectionTitle>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Web views" value={totals.views.web} />
        <StatCard label="Hyperview views" value={totals.views.hyperview} />
        <StatCard label="Web outbound clicks" value={totals.clicks.web} />
        <StatCard
          label="Hyperview outbound clicks"
          value={totals.clicks.hyperview}
        />
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
}: {
  label: string;
  value: number;
}) => (
  <div class="flex flex-col gap-2 rounded-radius border border-outline bg-surface px-4 py-3 shadow-sm">
    <p class="text-2xl font-semibold text-on-surface-strong">
      {value.toLocaleString()}
    </p>
    <p class="text-sm text-on-surface">{label}</p>
  </div>
);

export default AnalyticsSourceBreakdown;
