import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../../../components/app/SectionTitle.js";
import {
  formatAnalyticsDateRangeLabel
} from "../../book-analytics/dateRange.js";
import {
  getCreatorDailyFunnelTrends,
  getCreatorDailySourceTrends
} from "../../book-analytics/creatorAnalytics.js";
import {
  getDailyFunnelTrends,
  getDailySourceTrends
} from "../../book-analytics/trends.js";
const CHART_WIDTH = 800;
const CHART_HEIGHT = 240;
const PADDING = { top: 16, right: 16, bottom: 32, left: 48 };
const ADMIN_FUNNEL_SERIES = [
  { key: "views", label: "Views", color: "#1d4ed8" },
  { key: "clicks", label: "Outbound clicks", color: "#b91c1c" },
  { key: "wishlists", label: "Wishlists", color: "#c026d3" },
  { key: "collections", label: "Collections", color: "#047857" },
  { key: "follows", label: "Follows", color: "#d97706" }
];
const CREATOR_FUNNEL_SERIES = [
  { key: "views", label: "Views", color: "#1d4ed8" },
  { key: "clicks", label: "Outbound clicks", color: "#b91c1c" },
  { key: "wishlists", label: "Wishlists", color: "#c026d3" },
  { key: "collections", label: "Collections", color: "#047857" }
];
const SOURCE_SERIES = [
  { key: "viewsWeb", label: "Web views", color: "#1e3a8a" },
  { key: "viewsHyperview", label: "iOS views", color: "#ea580c" },
  { key: "clicksWeb", label: "Web clicks", color: "#991b1b" },
  { key: "clicksHyperview", label: "iOS clicks", color: "#6d28d9" }
];
const AnalyticsTrendChartsSection = async ({
  chartRange,
  dateRange,
  scope = null
}) => {
  const [funnelPoints, sourcePoints] = scope ? await Promise.all([
    getCreatorDailyFunnelTrends(scope, chartRange),
    getCreatorDailySourceTrends(scope, chartRange)
  ]) : await Promise.all([
    getDailyFunnelTrends(chartRange),
    getDailySourceTrends(chartRange)
  ]);
  const periodLabel = formatAnalyticsDateRangeLabel(dateRange ?? chartRange);
  const chartNote = dateRange === null ? scope ? " (last 30 days)" : " (last 90 days)" : "";
  const funnelSeries = scope ? CREATOR_FUNNEL_SERIES : ADMIN_FUNNEL_SERIES;
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-8", children: [
    /* @__PURE__ */ jsx(
      ChartBlock,
      {
        title: `Daily funnel trends${chartNote}`,
        subtitle: periodLabel,
        points: funnelPoints,
        series: funnelSeries
      }
    ),
    /* @__PURE__ */ jsx(
      ChartBlock,
      {
        title: `Daily source trends${chartNote}`,
        subtitle: periodLabel,
        points: sourcePoints,
        series: SOURCE_SERIES
      }
    )
  ] });
};
const ChartBlock = ({
  title,
  subtitle,
  points,
  series
}) => {
  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const maxValue = Math.max(
    1,
    ...points.flatMap(
      (point) => series.map((item) => Number(point[item.key] ?? 0))
    )
  );
  const xStep = points.length > 1 ? plotWidth / (points.length - 1) : 0;
  const toX = (index) => PADDING.left + index * xStep;
  const toY = (value) => PADDING.top + plotHeight - value / maxValue * plotHeight;
  const xLabels = pickXLabels(points);
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(SectionTitle, { children: title }),
      /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: subtitle })
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "overflow-x-auto rounded-radius border border-outline bg-surface p-4 shadow-sm", children: [
      /* @__PURE__ */ jsxs(
        "svg",
        {
          viewBox: `0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`,
          class: "w-full min-w-[640px]",
          role: "img",
          "aria-label": title,
          children: [
            /* @__PURE__ */ jsx(
              "line",
              {
                x1: PADDING.left,
                y1: PADDING.top + plotHeight,
                x2: PADDING.left + plotWidth,
                y2: PADDING.top + plotHeight,
                stroke: "currentColor",
                class: "text-outline"
              }
            ),
            /* @__PURE__ */ jsx(
              "text",
              {
                x: PADDING.left - 8,
                y: PADDING.top + 4,
                "text-anchor": "end",
                class: "fill-on-surface text-[10px]",
                children: maxValue.toLocaleString()
              }
            ),
            /* @__PURE__ */ jsx(
              "text",
              {
                x: PADDING.left - 8,
                y: PADDING.top + plotHeight,
                "text-anchor": "end",
                class: "fill-on-surface text-[10px]",
                children: "0"
              }
            ),
            series.map((item) => {
              const polyline = points.map((point, index) => {
                const value = Number(point[item.key] ?? 0);
                return `${toX(index)},${toY(value)}`;
              }).join(" ");
              return /* @__PURE__ */ jsx(
                "polyline",
                {
                  fill: "none",
                  stroke: item.color,
                  "stroke-width": "2.5",
                  points: polyline
                },
                item.key
              );
            }),
            xLabels.map(({ index, label }) => /* @__PURE__ */ jsx(
              "text",
              {
                x: toX(index),
                y: CHART_HEIGHT - 8,
                "text-anchor": "middle",
                class: "fill-on-surface text-[10px]",
                children: label
              },
              label
            ))
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { class: "mt-4 flex flex-wrap gap-4 text-sm text-on-surface", children: series.map((item) => /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            class: "inline-block h-2.5 w-2.5 rounded-full",
            style: { backgroundColor: item.color }
          }
        ),
        /* @__PURE__ */ jsx("span", { children: item.label })
      ] }, item.key)) })
    ] })
  ] });
};
function pickXLabels(points) {
  if (points.length === 0) return [];
  if (points.length <= 7) {
    return points.map((point, index) => ({
      index,
      label: formatShortDate(point.date)
    }));
  }
  const step = Math.ceil(points.length / 7);
  const labels = [];
  for (let index = 0; index < points.length; index += step) {
    labels.push({ index, label: formatShortDate(points[index].date) });
  }
  const lastIndex = points.length - 1;
  if (labels[labels.length - 1]?.index !== lastIndex) {
    labels.push({
      index: lastIndex,
      label: formatShortDate(points[lastIndex].date)
    });
  }
  return labels;
}
function formatShortDate(date) {
  const [, month, day] = date.split("-");
  return `${Number(month)}/${Number(day)}`;
}
var AnalyticsTrendChartsSection_default = AnalyticsTrendChartsSection;
export {
  AnalyticsTrendChartsSection_default as default
};
