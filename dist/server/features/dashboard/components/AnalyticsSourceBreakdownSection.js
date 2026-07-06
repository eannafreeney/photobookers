import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../../../components/app/SectionTitle.js";
import {
  getCreatorSourceTotals
} from "../../book-analytics/creatorAnalytics.js";
import { getSourceTotals } from "../../book-analytics/trends.js";
const AnalyticsSourceBreakdownSection = async ({
  dateRange,
  scope = null
}) => {
  const totals = scope ? await getCreatorSourceTotals(scope, dateRange) : await getSourceTotals(dateRange);
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Web vs iOS" }),
    /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Web views", value: totals.views.web }),
      /* @__PURE__ */ jsx(StatCard, { label: "iOS views", value: totals.views.hyperview }),
      /* @__PURE__ */ jsx(StatCard, { label: "Web outbound clicks", value: totals.clicks.web }),
      /* @__PURE__ */ jsx(StatCard, { label: "iOS outbound clicks", value: totals.clicks.hyperview })
    ] })
  ] });
};
const StatCard = ({
  label,
  value
}) => /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-2 rounded-radius border border-outline bg-surface px-4 py-3 shadow-sm", children: [
  /* @__PURE__ */ jsx("p", { class: "text-2xl font-semibold text-on-surface-strong", children: value.toLocaleString() }),
  /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: label })
] });
var AnalyticsSourceBreakdownSection_default = AnalyticsSourceBreakdownSection;
export {
  AnalyticsSourceBreakdownSection_default as default
};
