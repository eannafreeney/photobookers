import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  formatAnalyticsDateRangeLabel
} from "../../../../book-analytics/dateRange.js";
import { getCeoMetricsSnapshot } from "../../../../../domain/ceo-metrics/services.js";
import { CeoMetricCard } from "./CeoMetricCard.js";
const CeoMetricsBlock = async ({ dateRange }) => {
  const [error, snapshot] = await getCeoMetricsSnapshot(dateRange);
  if (error) {
    return /* @__PURE__ */ jsx("div", { class: "rounded-radius border border-outline bg-surface px-4 py-3 text-sm text-on-surface", children: error.reason });
  }
  const periodLabel = formatAnalyticsDateRangeLabel(snapshot.range);
  const previousLabel = formatAnalyticsDateRangeLabel(snapshot.previousRange);
  const { breakdown } = snapshot.editorialActions;
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-6", children: [
    /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx("h2", { class: "font-display text-xl font-medium text-on-surface-strong", children: "CEO overview" }),
      /* @__PURE__ */ jsxs("p", { class: "text-sm text-on-surface", children: [
        "Showing ",
        periodLabel,
        ". Week-over-week compares to ",
        previousLabel,
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-1 gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsx(
        CeoMetricCard,
        {
          label: "Weekly active collectors",
          value: snapshot.weeklyActiveCollectors.value,
          delta: snapshot.weeklyActiveCollectors.delta,
          detail: "Logged-in users who viewed, saved, followed, collected, or clicked buy."
        }
      ),
      /* @__PURE__ */ jsx(
        CeoMetricCard,
        {
          label: "Editorial-attributed actions",
          value: snapshot.editorialActions.value,
          delta: snapshot.editorialActions.delta,
          detail: `${breakdown.views.toLocaleString()} editorial views \xB7 ${breakdown.clicks.toLocaleString()} editorial clicks \xB7 ${breakdown.featuredWishlists.toLocaleString()} featured-book wishlists \xB7 ${breakdown.featuredFollows.toLocaleString()} spotlight follows`
        }
      ),
      /* @__PURE__ */ jsx(
        CeoMetricCard,
        {
          label: "New discoverable releases",
          value: snapshot.supplyHealth.newReleases.value,
          delta: snapshot.supplyHealth.newReleases.delta,
          detail: `${snapshot.supplyHealth.discoverableBooks.toLocaleString()} discoverable books \xB7 ${snapshot.supplyHealth.activeCreators.toLocaleString()} active creators`
        }
      )
    ] })
  ] });
};
var CeoMetricsBlock_default = CeoMetricsBlock;
export {
  CeoMetricsBlock_default as default
};
