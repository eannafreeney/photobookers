import type { AnalyticsDateRange } from "../../../../book-analytics/dateRange";
import { getAppDownloadsDashboard } from "../../../../app-store-analytics/appDownloads";
import AppAnalyticsCountriesTable from "./AppAnalyticsCountriesTable";
import AppAnalyticsOverviewSection from "./AppAnalyticsOverviewSection";
import { appAnalyticsDisclaimer } from "./appAnalyticsShared";
import AppAnalyticsTrendSection from "./AppAnalyticsTrendSection";

type Props = {
  dateRange: AnalyticsDateRange | null;
};

const AppAnalyticsBlock = async ({ dateRange }: Props) => {
  const [error, data] = await getAppDownloadsDashboard(dateRange);

  return (
    <div class="flex flex-col gap-12">
      <p class="text-sm text-on-surface">{appAnalyticsDisclaimer}</p>

      {error ? (
        <div class="rounded-radius border border-outline bg-surface px-4 py-3 text-sm text-on-surface">
          {error.reason}
        </div>
      ) : (
        <>
          <AppAnalyticsOverviewSection data={data} dateRange={dateRange} />
          <AppAnalyticsTrendSection data={data} dateRange={dateRange} />
          <AppAnalyticsCountriesTable data={data} />
        </>
      )}
    </div>
  );
};

export default AppAnalyticsBlock;
