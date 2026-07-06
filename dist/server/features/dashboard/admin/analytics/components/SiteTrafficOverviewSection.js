import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  formatAnalyticsDateRangeLabel
} from "../../../../book-analytics/dateRange.js";
import { formatDuration, formatEngagementRate } from "../../../../site-analytics/format.js";
import { AnalyticsStatCard } from "../../../components/AnalyticsStatCard.js";
const SiteTrafficOverviewSection = ({ data, dateRange }) => {
  const { overview, usesDefaultRange } = data;
  const periodLabel = formatAnalyticsDateRangeLabel(dateRange);
  const periodCopy = usesDefaultRange ? "Showing Google Analytics for the last 90 days (GA4 does not support all-time queries)" : `Showing Google Analytics for ${periodLabel}`;
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: periodCopy }),
    /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5", children: [
      /* @__PURE__ */ jsx(AnalyticsStatCard, { label: "Sessions", value: overview.sessions }),
      /* @__PURE__ */ jsx(AnalyticsStatCard, { label: "Users", value: overview.totalUsers }),
      /* @__PURE__ */ jsx(AnalyticsStatCard, { label: "New users", value: overview.newUsers }),
      /* @__PURE__ */ jsx(
        AnalyticsStatCard,
        {
          label: "Engagement rate",
          value: formatEngagementRate(overview.engagementRate)
        }
      ),
      /* @__PURE__ */ jsx(
        AnalyticsStatCard,
        {
          label: "Avg. session duration",
          value: formatDuration(overview.averageSessionDuration)
        }
      )
    ] })
  ] });
};
var SiteTrafficOverviewSection_default = SiteTrafficOverviewSection;
export {
  SiteTrafficOverviewSection_default as default
};
