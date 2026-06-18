import { getPurchaseClickTotals } from "../../../../purchase-clicks/services";

const AnalyticsOverview = async () => {
  const totals = await getPurchaseClickTotals();

  return (
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard label="Total outbound clicks" value={totals.totalClicks} />
      <StatCard label="Books with clicks" value={totals.booksWithClicks} />
      <StatCard
        label="Creators with clicks"
        value={totals.creatorsWithClicks}
      />
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div class="flex flex-col gap-2 rounded-radius border border-outline bg-surface px-4 py-3 shadow-sm">
    <p class="text-2xl font-semibold text-on-surface-strong">{value}</p>
    <p class="text-sm text-on-surface">{label}</p>
  </div>
);

export default AnalyticsOverview;
