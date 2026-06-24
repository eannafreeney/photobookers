export const AnalyticsStatCard = ({
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
