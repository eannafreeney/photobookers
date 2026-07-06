import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  formatAnalyticsDateRangeLabel
} from "../../../../book-analytics/dateRange.js";
import { AnalyticsStatCard } from "../../../components/AnalyticsStatCard.js";
const AppAnalyticsOverviewSection = ({ data, dateRange }) => {
  const { overview, usesDefaultRange } = data;
  const periodLabel = formatAnalyticsDateRangeLabel(dateRange);
  const periodCopy = usesDefaultRange ? "Showing App Store downloads for the last 30 days" : `Showing App Store downloads for ${periodLabel}`;
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: periodCopy }),
    /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsx(AnalyticsStatCard, { label: "Total downloads", value: overview.downloads }),
      /* @__PURE__ */ jsx(
        AnalyticsStatCard,
        {
          label: "First-time downloads",
          value: overview.firstTimeDownloads
        }
      ),
      /* @__PURE__ */ jsx(AnalyticsStatCard, { label: "Redownloads", value: overview.redownloads })
    ] })
  ] });
};
var AppAnalyticsOverviewSection_default = AppAnalyticsOverviewSection;
export {
  AppAnalyticsOverviewSection_default as default
};
