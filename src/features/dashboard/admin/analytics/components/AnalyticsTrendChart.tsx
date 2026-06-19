import SectionTitle from "../../../../../components/app/SectionTitle";
import {
  formatAnalyticsDateRangeLabel,
  type AnalyticsDateRange,
} from "../../../../book-analytics/dateRange";
import {
  getDailyFunnelTrends,
  getDailySourceTrends,
} from "../../../../book-analytics/trends";

type Props = {
  chartRange: AnalyticsDateRange;
  dateRange: AnalyticsDateRange | null;
};

const CHART_WIDTH = 800;
const CHART_HEIGHT = 240;
const PADDING = { top: 16, right: 16, bottom: 32, left: 48 };

const FUNNEL_SERIES = [
  { key: "views" as const, label: "Views", color: "#2563eb" },
  { key: "clicks" as const, label: "Outbound clicks", color: "#dc2626" },
  { key: "wishlists" as const, label: "Wishlists", color: "#7c3aed" },
  { key: "collections" as const, label: "Collections", color: "#059669" },
];

const SOURCE_SERIES = [
  { key: "viewsWeb" as const, label: "Web views", color: "#2563eb" },
  {
    key: "viewsHyperview" as const,
    label: "Hyperview views",
    color: "#60a5fa",
  },
  { key: "clicksWeb" as const, label: "Web clicks", color: "#dc2626" },
  {
    key: "clicksHyperview" as const,
    label: "Hyperview clicks",
    color: "#f87171",
  },
];

const AnalyticsTrendCharts = async ({ chartRange, dateRange }: Props) => {
  const [funnelPoints, sourcePoints] = await Promise.all([
    getDailyFunnelTrends(chartRange),
    getDailySourceTrends(chartRange),
  ]);

  const periodLabel = formatAnalyticsDateRangeLabel(dateRange ?? chartRange);
  const chartNote =
    dateRange === null ? " (last 90 days)" : "";

  return (
    <div class="flex flex-col gap-8">
      <ChartBlock
        title={`Daily funnel trends${chartNote}`}
        subtitle={periodLabel}
        points={funnelPoints}
        series={FUNNEL_SERIES}
      />
      <ChartBlock
        title={`Daily source trends${chartNote}`}
        subtitle={periodLabel}
        points={sourcePoints}
        series={SOURCE_SERIES}
      />
    </div>
  );
};

type SeriesConfig<T extends Record<string, string | number>> = {
  key: keyof T & string;
  label: string;
  color: string;
};

const ChartBlock = <T extends { date: string }>({
  title,
  subtitle,
  points,
  series,
}: {
  title: string;
  subtitle: string;
  points: T[];
  series: SeriesConfig<T>[];
}) => {
  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const maxValue = Math.max(
    1,
    ...points.flatMap((point) =>
      series.map((item) => Number(point[item.key] ?? 0)),
    ),
  );

  const xStep = points.length > 1 ? plotWidth / (points.length - 1) : 0;

  const toX = (index: number) => PADDING.left + index * xStep;
  const toY = (value: number) =>
    PADDING.top + plotHeight - (value / maxValue) * plotHeight;

  const xLabels = pickXLabels(points);

  return (
    <div class="flex flex-col gap-4">
      <div>
        <SectionTitle>{title}</SectionTitle>
        <p class="text-sm text-on-surface">{subtitle}</p>
      </div>
      <div class="overflow-x-auto rounded-radius border border-outline bg-surface p-4 shadow-sm">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          class="w-full min-w-[640px]"
          role="img"
          aria-label={title}
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

          {series.map((item) => {
            const polyline = points
              .map((point, index) => {
                const value = Number(point[item.key] ?? 0);
                return `${toX(index)},${toY(value)}`;
              })
              .join(" ");

            return (
              <polyline
                key={item.key}
                fill="none"
                stroke={item.color}
                stroke-width="2"
                points={polyline}
              />
            );
          })}

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

        <div class="mt-4 flex flex-wrap gap-4 text-sm text-on-surface">
          {series.map((item) => (
            <div key={item.key} class="flex items-center gap-2">
              <span
                class="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function pickXLabels<T extends { date: string }>(
  points: T[],
): { index: number; label: string }[] {
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
    labels.push({ index: lastIndex, label: formatShortDate(points[lastIndex].date) });
  }
  return labels;
}

function formatShortDate(date: string): string {
  const [, month, day] = date.split("-");
  return `${Number(month)}/${Number(day)}`;
}

export default AnalyticsTrendCharts;
