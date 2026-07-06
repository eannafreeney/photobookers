import {
  analyticsSearchParams
} from "../../../book-analytics/dateRange.js";
const ADMIN_ANALYTICS_PANEL_ID = "admin-analytics-panel";
const ADMIN_ANALYTICS_FRAGMENT = "panel";
const ADMIN_ANALYTICS_BASE_PATH = "/dashboard/admin/analytics";
const TAB_QUERY_VALUES = [
  "overview",
  "books",
  "site",
  "app",
  "newsletter"
];
function adminAnalyticsHref(dateRange, options) {
  const tab = options?.tab && TAB_QUERY_VALUES.includes(options.tab) && options.tab !== "overview" ? options.tab : void 0;
  return `${ADMIN_ANALYTICS_BASE_PATH}${analyticsSearchParams(dateRange, {
    tab,
    fragment: options?.fragment ? ADMIN_ANALYTICS_FRAGMENT : void 0
  })}`;
}
export {
  ADMIN_ANALYTICS_BASE_PATH,
  ADMIN_ANALYTICS_FRAGMENT,
  ADMIN_ANALYTICS_PANEL_ID,
  adminAnalyticsHref
};
