import {
  analyticsSearchParams,
  matchesPreset,
  matchesYesterdayPreset,
  presetAnalyticsDateRange,
  yesterdayAnalyticsDateRange,
  type AnalyticsDateRange,
} from "../../book-analytics/dateRange";
import { toDateString } from "../../../lib/utils";
import Button from "../../../components/app/Button";

type Props = {
  dateRange: AnalyticsDateRange | null;
  basePath: string;
  partialUpdateTarget?: string;
  tab?: string;
  fragment?: string;
};

const PRESETS = [
  { label: "All time", days: null },
  { label: "Yesterday", days: "yesterday" as const },
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

const AnalyticsDateRangeFilter = ({
  dateRange,
  basePath,
  partialUpdateTarget,
  tab,
  fragment,
}: Props) => {
  const searchParams = (range: AnalyticsDateRange | null) =>
    analyticsSearchParams(range, {
      ...(tab ? { tab } : {}),
      ...(fragment ? { fragment } : {}),
    });
  const customFrom = dateRange ? toDateString(dateRange.from) : "";
  const customTo = dateRange ? toDateString(dateRange.to) : "";

  return (
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-center gap-2">
        {PRESETS.map((preset) => {
          const href =
            preset.days === null
              ? `${basePath}${searchParams(null)}`
              : preset.days === "yesterday"
                ? `${basePath}${searchParams(yesterdayAnalyticsDateRange())}`
                : `${basePath}${searchParams(
                    presetAnalyticsDateRange(preset.days),
                  )}`;
          const active =
            preset.days === null
              ? dateRange === null
              : preset.days === "yesterday"
                ? matchesYesterdayPreset(dateRange)
                : matchesPreset(dateRange, preset.days);

          return (
            <a
              key={preset.label}
              href={href}
              class={pillClass(active)}
              aria-current={active ? "page" : undefined}
              {...(partialUpdateTarget
                ? {
                    "x-target": partialUpdateTarget,
                    prefetch: "intent",
                  }
                : {})}
            >
              {preset.label}
            </a>
          );
        })}
      </div>

      <form
        method="get"
        action={basePath}
        class="flex flex-wrap items-end justify-center gap-3"
        {...(partialUpdateTarget ? { "x-target": partialUpdateTarget } : {})}
      >
        {tab ? <input type="hidden" name="tab" value={tab} /> : null}
        {fragment ? (
          <input type="hidden" name="fragment" value={fragment} />
        ) : null}
        <label class="flex flex-col gap-1 text-sm text-on-surface">
          <span>From</span>
          <input
            type="date"
            name="from"
            value={customFrom}
            class="rounded-radius border border-outline bg-surface px-2 py-2 text-sm text-on-surface focus:outline focus:outline-offset-2 focus:outline-primary"
            required
          />
        </label>
        <label class="flex flex-col gap-1 text-sm text-on-surface">
          <span>To</span>
          <input
            type="date"
            name="to"
            value={customTo}
            class="rounded-radius border border-outline bg-surface px-2 py-2 text-sm text-on-surface focus:outline focus:outline-offset-2 focus:outline-primary"
            required
          />
        </label>
        <Button variant="solid" color="primary">
          Apply
        </Button>
      </form>
    </div>
  );
};

export default AnalyticsDateRangeFilter;
