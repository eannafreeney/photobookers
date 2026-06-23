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
import AnalyticsDateRangeFilter from "../../../../features/dashboard/components/AnalyticsDateRangeFilter";
import AnalyticsOverviewSection from "../../../../features/dashboard/components/AnalyticsOverviewSection";
import AnalyticsSourceBreakdownSection from "../../../../features/dashboard/components/AnalyticsSourceBreakdownSection";
import AnalyticsTrendChartsSection from "../../../../features/dashboard/components/AnalyticsTrendChartsSection";
import TopBooksByClicksSection from "../../../../features/dashboard/components/TopBooksByClicksSection";
import TopBooksByFavoritesSection from "../../../../features/dashboard/components/TopBooksByFavoritesSection";
import TopBooksByViewsSection from "../../../../features/dashboard/components/TopBooksByViewsSection";
import TopCreatorsTable from "../../../../features/dashboard/admin/analytics/components/TopCreatorsTable";
import TopCreatorsByFollowsTable from "../../../../features/dashboard/admin/analytics/components/TopCreatorsByFollowsTable";
import { paginationRequestBaseUrl } from "../../../../lib/pagination";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const publisherPage = Number(c.req.query("publisherPage") ?? 1);
  const viewsPage = Number(c.req.query("viewsPage") ?? 1);

  const bookPage = Number(c.req.query("bookPage") ?? 1);
  const artistPage = Number(c.req.query("artistPage") ?? 1);
  const favoritesPage = Number(c.req.query("favoritesPage") ?? 1);
  const followsPage = Number(c.req.query("followsPage") ?? 1);

  const viewsPaginationBaseUrl = paginationRequestBaseUrl(
    c.req.url,
    "viewsPage",
  );
  const bookPaginationBaseUrl = paginationRequestBaseUrl(c.req.url, "bookPage");
  const publisherPaginationBaseUrl = paginationRequestBaseUrl(
    c.req.url,
    "publisherPage",
  );
  const artistPaginationBaseUrl = paginationRequestBaseUrl(
    c.req.url,
    "artistPage",
  );
  const favoritesPaginationBaseUrl = paginationRequestBaseUrl(
    c.req.url,
    "favoritesPage",
  );
  const followsPaginationBaseUrl = paginationRequestBaseUrl(
    c.req.url,
    "followsPage",
  );
  const currentPath = c.req.path;
  const dateRange = parseAnalyticsDateRange(
    c.req.query("from"),
    c.req.query("to"),
  );
  const chartRange = dateRange ?? presetAnalyticsDateRange(30);

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
              <AnalyticsDateRangeFilter
                dateRange={dateRange}
                basePath="/dashboard/admin/analytics"
              />
            </div>
            <AnalyticsOverviewSection dateRange={dateRange} />
            <AnalyticsTrendChartsSection
              chartRange={chartRange}
              dateRange={dateRange}
            />
            <AnalyticsSourceBreakdownSection dateRange={dateRange} />
            <TopBooksByViewsSection
              dateRange={dateRange}
              currentPath={viewsPaginationBaseUrl}
              currentPage={viewsPage}
              pageParam="viewsPage"
            />
            <TopBooksByClicksSection
              dateRange={dateRange}
              currentPath={bookPaginationBaseUrl}
              currentPage={bookPage}
              pageParam="bookPage"
            />
            <TopCreatorsTable
              role="publisher"
              title="Top publishers"
              dateRange={dateRange}
              currentPath={publisherPaginationBaseUrl}
              currentPage={publisherPage}
              pageParam="publisherPage"
            />
            <TopCreatorsTable
              role="artist"
              title="Top artists"
              dateRange={dateRange}
              currentPath={artistPaginationBaseUrl}
              currentPage={artistPage}
              pageParam="artistPage"
            />
            <TopBooksByFavoritesSection
              dateRange={dateRange}
              currentPath={favoritesPaginationBaseUrl}
              currentPage={favoritesPage}
              pageParam="favoritesPage"
            />
            <TopCreatorsByFollowsTable
              dateRange={dateRange}
              currentPath={followsPaginationBaseUrl}
              currentPage={followsPage}
              pageParam="followsPage"
            />
          </div>
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});
