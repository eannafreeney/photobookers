import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { getAppDownloadsDashboard } from "../../../../app-store-analytics/appDownloads.js";
import AppAnalyticsCountriesTable from "./AppAnalyticsCountriesTable.js";
import AppAnalyticsOverviewSection from "./AppAnalyticsOverviewSection.js";
import { appAnalyticsDisclaimer } from "./appAnalyticsShared.js";
import AppAnalyticsTrendSection from "./AppAnalyticsTrendSection.js";
const AppAnalyticsBlock = async ({ dateRange }) => {
  const [error, data] = await getAppDownloadsDashboard(dateRange);
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-12", children: [
    /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: appAnalyticsDisclaimer }),
    error ? /* @__PURE__ */ jsx("div", { class: "rounded-radius border border-outline bg-surface px-4 py-3 text-sm text-on-surface", children: error.reason }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(AppAnalyticsOverviewSection, { data, dateRange }),
      /* @__PURE__ */ jsx(AppAnalyticsTrendSection, { data, dateRange }),
      /* @__PURE__ */ jsx(AppAnalyticsCountriesTable, { data })
    ] })
  ] });
};
var AppAnalyticsBlock_default = AppAnalyticsBlock;
export {
  AppAnalyticsBlock_default as default
};
