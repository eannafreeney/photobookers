import type { DailySignupPoint } from "../../../../newsletter-analytics/signups";
import SectionTitle from "../../../../../components/app/SectionTitle";
import {
  formatAnalyticsDateRangeLabel,
  type AnalyticsDateRange,
} from "../../../../book-analytics/dateRange";
import type { NewsletterAnalyticsDataProps } from "./newsletterAnalyticsShared";

type Props = NewsletterAnalyticsDataProps & {
  dateRange: AnalyticsDateRange | null;
};

const CHART_WIDTH = 800;
const CHART_HEIGHT = 240;
const PADDING = { top: 16, right: 16, bottom: 32, left: 48 };

const NewsletterAnalyticsTrendSection = ({ data, dateRange }: Props) => {
  const subtitle = data.usesDefaultRange
    ? "Last 30 days"
    : formatAnalyticsDateRangeLabel(dateRange);
  const points: DailySignupPoint[] = data.dailyTrend;
  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const maxValue = Math.max(1, ...points.map((point) => point.signups));
  const xStep = points.length > 1 ? plotWidth / (points.length - 1) : 0;
  const toX = (index: number) => PADDING.left + index * xStep;
  const toY = (value: number) =>
    PADDING.top + plotHeight - (value / maxValue) * plotHeight;
  const xLabels = pickXLabels(points);
  const polyline = points
    .map((point, index) => `${toX(index)},${toY(point.signups)}`)
    .join(" ");

  return (
    <div class="flex flex-col gap-4">
      <div>
        <SectionTitle>Daily newsletter signups</SectionTitle>
        <p class="text-sm text-on-surface">{subtitle}</p>
      </div>
      {points.length === 0 ? (
        <p class="text-sm text-on-surface">No signup data for this period.</p>
      ) : (
        <div class="overflow-x-auto rounded-radius border border-outline bg-surface p-4 shadow-sm">
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            class="w-full min-w-[640px]"
            role="img"
            aria-label="Daily newsletter signups"
          >
            <line
              x1={PADDING.left}
              y1={PADDING.top + plotHeight}
              x2={PADDING.left + plotWidth}
              y2={PADDING.top + plotHeight}
              stroke="currentColor"
              class="text-outline"
            />
            <text
              x={PADDING.left - 8}
              y={PADDING.top + 4}
              text-anchor="end"
              class="fill-on-surface text-[10px]"
            >
              {maxValue.toLocaleString()}
            </text>
            <text
              x={PADDING.left - 8}
              y={PADDING.top + plotHeight}
              text-anchor="end"
              class="fill-on-surface text-[10px]"
            >
              0
            </text>
            <polyline
              fill="none"
              stroke="#1d4ed8"
              stroke-width="2.5"
              points={polyline}
            />
            {xLabels.map(({ index, label }) => (
              <text
                key={label}
                x={toX(index)}
                y={CHART_HEIGHT - 8}
                text-anchor="middle"
                class="fill-on-surface text-[10px]"
              >
                {label}
              </text>
            ))}
          </svg>
          <div class="mt-4 flex items-center gap-2 text-sm text-on-surface">
            <span
              class="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: "#1d4ed8" }}
            />
            <span>Signups</span>
          </div>
        </div>
      )}
    </div>
  );
};

function pickXLabels(points: DailySignupPoint[]): {
  index: number;
  label: string;
}[] {
  if (points.length === 0) return [];
  if (points.length <= 7) {
    return points.map((point, index) => ({
      index,
      label: formatShortDate(point.date),
    }));
  }

  const step = Math.ceil(points.length / 7);
  const labels: { index: number; label: string }[] = [];
  for (let index = 0; index < points.length; index += step) {
    labels.push({ index, label: formatShortDate(points[index].date) });
  }
  const lastIndex = points.length - 1;
  if (labels[labels.length - 1]?.index !== lastIndex) {
    labels.push({
      index: lastIndex,
      label: formatShortDate(points[lastIndex].date),
    });
  }
  return labels;
}

function formatShortDate(date: string): string {
  const [, month, day] = date.split("-");
  return `${Number(month)}/${Number(day)}`;
}

export default NewsletterAnalyticsTrendSection;
