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
import AdminAnalyticsPanel from "../../../../features/dashboard/admin/analytics/components/AdminAnalyticsPanel";
import { parseAnalyticsSectionTab } from "../../../../features/dashboard/admin/analytics/components/AnalyticsSectionTabs";
import { ADMIN_ANALYTICS_FRAGMENT } from "../../../../features/dashboard/admin/analytics/adminAnalyticsPanel";
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
  const tab = parseAnalyticsSectionTab(c.req.query("tab"));

  const panel = (
    <AdminAnalyticsPanel
      tab={tab}
      dateRange={dateRange}
      chartRange={chartRange}
      viewsPaginationBaseUrl={viewsPaginationBaseUrl}
      viewsPage={viewsPage}
      bookPaginationBaseUrl={bookPaginationBaseUrl}
      bookPage={bookPage}
      publisherPaginationBaseUrl={publisherPaginationBaseUrl}
      publisherPage={publisherPage}
      artistPaginationBaseUrl={artistPaginationBaseUrl}
      artistPage={artistPage}
      favoritesPaginationBaseUrl={favoritesPaginationBaseUrl}
      favoritesPage={favoritesPage}
      followsPaginationBaseUrl={followsPaginationBaseUrl}
      followsPage={followsPage}
    />
  );

  if (c.req.query("fragment") === ADMIN_ANALYTICS_FRAGMENT) {
    return c.html(panel);
  }

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
            <SectionTitle>Analytics</SectionTitle>
            {panel}
          </div>
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});
