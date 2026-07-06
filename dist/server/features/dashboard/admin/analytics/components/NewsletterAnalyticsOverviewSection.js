import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../../components/app/Button.js";
import {
  formatAnalyticsDateRangeLabel
} from "../../../../book-analytics/dateRange.js";
import { AnalyticsStatCard } from "../../../components/AnalyticsStatCard.js";
const NewsletterAnalyticsOverviewSection = ({ data, dateRange }) => {
  const periodLabel = formatAnalyticsDateRangeLabel(dateRange);
  const periodCopy = data.usesDefaultRange ? "Showing newsletter signups for the last 30 days" : `Showing newsletter signups for ${periodLabel}`;
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: periodCopy }),
    /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsx(
        AnalyticsStatCard,
        {
          label: "Total subscribers",
          value: data.totalSubscribers
        }
      ),
      /* @__PURE__ */ jsx(
        AnalyticsStatCard,
        {
          label: "New signups in period",
          value: data.overview.signupsInPeriod
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsx(
        "a",
        {
          href: data.brevoListUrl,
          target: "_blank",
          rel: "noopener noreferrer",
          children: /* @__PURE__ */ jsxs(Button, { variant: "outline", color: "primary", width: "auto", children: [
            "Open ",
            data.listName,
            " in Brevo"
          ] })
        }
      ),
      /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: "View full list details, unsubscribes, and campaign stats in Brevo." })
    ] })
  ] });
};
var NewsletterAnalyticsOverviewSection_default = NewsletterAnalyticsOverviewSection;
export {
  NewsletterAnalyticsOverviewSection_default as default
};
