import type { PeriodDelta } from "../../../../../domain/ceo-metrics/format";

const deltaColor = (direction: PeriodDelta["direction"]) => {
  if (direction === "up") return "text-green-700";
  if (direction === "down") return "text-red-700";
  return "text-on-surface";
};

export const CeoMetricCard = ({
  label,
  value,
  delta,
  detail,
}: {
  label: string;
  value: number | string;
  delta?: PeriodDelta;
  detail?: string;
}) => (
  <div class="flex flex-col gap-2 rounded-radius border border-outline bg-surface px-4 py-3 shadow-sm">
    <p class="text-2xl font-semibold text-on-surface-strong">
      {typeof value === "number" ? value.toLocaleString() : value}
    </p>
    <p class="text-sm text-on-surface">{label}</p>
    {delta ? (
      <p class={`text-xs ${deltaColor(delta.direction)}`}>{delta.label}</p>
    ) : null}
    {detail ? <p class="text-xs text-on-surface">{detail}</p> : null}
  </div>
);
