import type { AppDownloadsDashboard } from "../../../../app-store-analytics/appDownloads";

export const appAnalyticsDisclaimer =
  "iOS download data from App Store Connect Sales and Trends; reports are typically delayed 24–48 hours.";

export type AppAnalyticsDataProps = {
  data: AppDownloadsDashboard;
};
