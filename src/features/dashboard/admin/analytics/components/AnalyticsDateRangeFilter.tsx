import {
  analyticsSearchParams,
  matchesPreset,
  presetAnalyticsDateRange,
  type AnalyticsDateRange,
} from "../../../../book-analytics/dateRange";
import { toDateString } from "../../../../../lib/utils";

type Props = {
  dateRange: AnalyticsDateRange | null;
};

const PRESETS = [
  { label: "All time", days: null },
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
] as const;

const pillClass = (active: boolean) =>
  `cursor-pointer px-4 py-1.5 rounded-full border-2 kicker transition-colors ${
    active
      ? "bg-on-surface-strong text-surface border-on-surface-strong"
      : "bg-surface text-on-surface-strong border-outline-strong hover:bg-on-surface-strong hover:text-surface"
  }`;

const AnalyticsDateRangeFilter = ({ dateRange }: Props) => {
  const customFrom = dateRange ? toDateString(dateRange.from) : "";
  const customTo = dateRange ? toDateString(dateRange.to) : "";

  return (
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-center gap-2">
        {PRESETS.map((preset) => {
          const href =
            preset.days === null
              ? "/dashboard/admin/analytics"
              : `/dashboard/admin/analytics${analyticsSearchParams(
                  presetAnalyticsDateRange(preset.days),
                )}`;
          const active =
            preset.days === null
              ? dateRange === null
              : matchesPreset(dateRange, preset.days);

          return (
            <a
              key={preset.label}
              href={href}
              class={pillClass(active)}
              aria-current={active ? "page" : undefined}
            >
              {preset.label}
            </a>
          );
        })}
      </div>

      <form
        method="get"
        action="/dashboard/admin/analytics"
        class="flex flex-wrap items-end justify-center gap-3"
      >
        <label class="flex flex-col gap-1 text-sm text-on-surface">
          <span>From</span>
          <input
            type="date"
            name="from"
            value={customFrom}
            class="input validator"
            required
          />
        </label>
        <label class="flex flex-col gap-1 text-sm text-on-surface">
          <span>To</span>
          <input
            type="date"
            name="to"
            value={customTo}
            class="input validator"
            required
          />
        </label>
        <button type="submit" class="btn btn-primary">
          Apply
        </button>
      </form>
    </div>
  );
};

export default AnalyticsDateRangeFilter;
