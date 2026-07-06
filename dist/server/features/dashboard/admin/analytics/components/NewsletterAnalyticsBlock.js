import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { getNewsletterSignupsDashboard } from "../../../../newsletter-analytics/signups.js";
import NewsletterAnalyticsOverviewSection from "./NewsletterAnalyticsOverviewSection.js";
import { newsletterAnalyticsDisclaimer } from "./newsletterAnalyticsShared.js";
import NewsletterAnalyticsTrendSection from "./NewsletterAnalyticsTrendSection.js";
const NewsletterAnalyticsBlock = async ({ dateRange }) => {
  const [error, data] = await getNewsletterSignupsDashboard(dateRange);
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-12", children: [
    /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: newsletterAnalyticsDisclaimer }),
    error ? /* @__PURE__ */ jsx("div", { class: "rounded-radius border border-outline bg-surface px-4 py-3 text-sm text-on-surface", children: error.reason }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(NewsletterAnalyticsOverviewSection, { data, dateRange }),
      /* @__PURE__ */ jsx(NewsletterAnalyticsTrendSection, { data, dateRange })
    ] })
  ] });
};
var NewsletterAnalyticsBlock_default = NewsletterAnalyticsBlock;
export {
  NewsletterAnalyticsBlock_default as default
};
