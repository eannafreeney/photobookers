import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  formatAnalyticsDateRangeLabel
} from "../../book-analytics/dateRange.js";
import {
  getCreatorFunnelTotals
} from "../../book-analytics/creatorAnalytics.js";
import { getOverallFunnelTotals } from "../../book-analytics/funnel.js";
import { getFollowTotal } from "../../book-analytics/trends.js";
import { getBookViewTotals } from "../../book-views/services.js";
import { getCreatorViewTotals } from "../../creator-views/services.js";
import { getPurchaseClickTotals } from "../../purchase-clicks/services.js";
const AnalyticsOverviewSection = async ({ dateRange, scope = null }) => {
  if (scope) {
    const totals = await getCreatorFunnelTotals(scope, dateRange);
    const clickRateLabel2 = totals.clickRate !== null ? `${totals.clickRate}%` : "\u2014";
    const periodLabel2 = formatAnalyticsDateRangeLabel(dateRange);
    const periodCopy = dateRange === null ? "Showing all-time metrics for your books" : `Showing metrics for your books during ${periodLabel2}`;
    return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
      /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: periodCopy }),
      /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: [
        /* @__PURE__ */ jsx(StatCard, { label: "Total book views", value: totals.views }),
        /* @__PURE__ */ jsx(StatCard, { label: "Books with views", value: totals.booksWithViews }),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            label: "Total outbound clicks",
            value: totals.outboundClicks
          }
        ),
        /* @__PURE__ */ jsx(StatCard, { label: "Overall click rate", value: clickRateLabel2 }),
        /* @__PURE__ */ jsx(StatCard, { label: "Total Favorited", value: totals.favorites }),
        /* @__PURE__ */ jsx(StatCard, { label: "Total follows", value: totals.follows })
      ] })
    ] });
  }
  const [
    viewTotals,
    creatorViewTotals,
    clickTotals,
    funnelTotals,
    followTotal
  ] = await Promise.all([
    getBookViewTotals(dateRange),
    getCreatorViewTotals(dateRange),
    getPurchaseClickTotals(dateRange),
    getOverallFunnelTotals(dateRange),
    getFollowTotal(dateRange)
  ]);
  const clickRateLabel = funnelTotals.clickRate !== null ? `${funnelTotals.clickRate}%` : "\u2014";
  const periodLabel = formatAnalyticsDateRangeLabel(dateRange);
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxs("p", { class: "text-sm text-on-surface", children: [
      "Showing metrics for ",
      /* @__PURE__ */ jsx("span", { class: "font-medium", children: periodLabel })
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Total book views", value: viewTotals.totalViews }),
      /* @__PURE__ */ jsx(StatCard, { label: "Books with views", value: viewTotals.booksWithViews }),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Publisher page views",
          value: creatorViewTotals.publisherPageViews
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Artist page views",
          value: creatorViewTotals.artistPageViews
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Total outbound clicks",
          value: clickTotals.totalClicks
        }
      ),
      /* @__PURE__ */ jsx(StatCard, { label: "Overall click rate", value: clickRateLabel }),
      /* @__PURE__ */ jsx(StatCard, { label: "Total favorites", value: funnelTotals.favorites }),
      /* @__PURE__ */ jsx(StatCard, { label: "Total follows", value: followTotal })
    ] })
  ] });
};
const StatCard = ({
  label,
  value
}) => /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-2 rounded-radius border border-outline bg-surface px-4 py-3 shadow-sm", children: [
  /* @__PURE__ */ jsx("p", { class: "text-2xl font-semibold text-on-surface-strong", children: typeof value === "number" ? value.toLocaleString() : value }),
  /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: label })
] });
var AnalyticsOverviewSection_default = AnalyticsOverviewSection;
export {
  AnalyticsOverviewSection_default as default
};
