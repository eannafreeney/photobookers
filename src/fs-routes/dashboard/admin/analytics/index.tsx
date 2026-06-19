import { createRoute } from "hono-fsr";
import { Context } from "hono";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import Sidebar from "../../../../components/app/Sidebar";
import SectionTitle from "../../../../components/app/SectionTitle";
import { getFlash, getUser } from "../../../../utils";
import {
  parseAnalyticsDateRange,
  presetAnalyticsDateRange,
} from "../../../../features/book-analytics/dateRange";
import AnalyticsDateRangeFilter from "../../../../features/dashboard/admin/analytics/components/AnalyticsDateRangeFilter";
import AnalyticsOverview from "../../../../features/dashboard/admin/analytics/components/AnalyticsOverview";
import AnalyticsSourceBreakdown from "../../../../features/dashboard/admin/analytics/components/AnalyticsSourceBreakdown";
import AnalyticsTrendCharts from "../../../../features/dashboard/admin/analytics/components/AnalyticsTrendChart";
import TopBooksTable from "../../../../features/dashboard/admin/analytics/components/TopBooksTable";
import TopBooksByViewsTable from "../../../../features/dashboard/admin/analytics/components/TopBooksByViewsTable";
import TopCreatorsTable from "../../../../features/dashboard/admin/analytics/components/TopCreatorsTable";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const dateRange = parseAnalyticsDateRange(
    c.req.query("from"),
    c.req.query("to"),
  );
  const chartRange = dateRange ?? presetAnalyticsDateRange(90);

  return c.html(
    <AppLayout
      title="Analytics"
      user={user}
      flash={flash}
      currentPath={currentPath}
    >
      <Page>
        <Sidebar currentPath={currentPath}>
          <div class="flex flex-col gap-12">
            <div class="flex flex-col gap-6">
              <SectionTitle>Book analytics</SectionTitle>
              <AnalyticsDateRangeFilter dateRange={dateRange} />
            </div>
            <AnalyticsOverview dateRange={dateRange} />
            <AnalyticsTrendCharts
              chartRange={chartRange}
              dateRange={dateRange}
            />
            <AnalyticsSourceBreakdown dateRange={dateRange} />
            <TopBooksByViewsTable dateRange={dateRange} />
            <TopBooksTable dateRange={dateRange} />
            <TopCreatorsTable
              role="publisher"
              title="Top publishers"
              dateRange={dateRange}
            />
            <TopCreatorsTable
              role="artist"
              title="Top artists"
              dateRange={dateRange}
            />
          </div>
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});
