import {
  analyticsSearchParams,
  type AnalyticsDateRange,
} from "../../../book-analytics/dateRange";
import type { AnalyticsSectionTab } from "./components/AnalyticsSectionTabs";

export const ADMIN_ANALYTICS_PANEL_ID = "admin-analytics-panel";
export const ADMIN_ANALYTICS_FRAGMENT = "panel";
export const ADMIN_ANALYTICS_BASE_PATH = "/dashboard/admin/analytics";
export const ADMIN_ANALYTICS_FANS_PATH = `${ADMIN_ANALYTICS_BASE_PATH}/fans`;
export const ADMIN_ANALYTICS_VERIFIED_CREATORS_PATH = `${ADMIN_ANALYTICS_BASE_PATH}/verified-creators`;

const TAB_QUERY_VALUES: AnalyticsSectionTab[] = [
  "overview",
  "books",
  "site",
  "app",
  "newsletter",
];

export function adminAnalyticsHref(
  dateRange: AnalyticsDateRange | null,
  options?: { tab?: AnalyticsSectionTab; fragment?: boolean },
): string {
  const tab =
    options?.tab &&
    TAB_QUERY_VALUES.includes(options.tab) &&
    options.tab !== "overview"
      ? options.tab
      : undefined;
  return `${ADMIN_ANALYTICS_BASE_PATH}${analyticsSearchParams(dateRange, {
    tab,
    fragment: options?.fragment ? ADMIN_ANALYTICS_FRAGMENT : undefined,
  })}`;
}
