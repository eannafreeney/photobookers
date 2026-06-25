import {
  analyticsSearchParams,
  type AnalyticsDateRange,
} from "../../../book-analytics/dateRange";
import type { AnalyticsSectionTab } from "./components/AnalyticsSectionTabs";

export const ADMIN_ANALYTICS_PANEL_ID = "admin-analytics-panel";
export const ADMIN_ANALYTICS_FRAGMENT = "panel";
export const ADMIN_ANALYTICS_BASE_PATH = "/dashboard/admin/analytics";

export function adminAnalyticsHref(
  dateRange: AnalyticsDateRange | null,
  options?: { tab?: AnalyticsSectionTab; fragment?: boolean },
): string {
  const tab =
    options?.tab === "site" || options?.tab === "app"
      ? options.tab
      : undefined;
  return `${ADMIN_ANALYTICS_BASE_PATH}${analyticsSearchParams(dateRange, {
    tab,
    fragment: options?.fragment ? ADMIN_ANALYTICS_FRAGMENT : undefined,
  })}`;
}
