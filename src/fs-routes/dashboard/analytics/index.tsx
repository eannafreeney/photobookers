import { createRoute } from "hono-fsr";
import { Context } from "hono";
import AppLayout from "../../../components/layouts/AppLayout";
import SectionTitle from "../../../components/app/SectionTitle";
import { getFlash, getUser } from "../../../utils";
import {
  parseAnalyticsDateRange,
  presetAnalyticsDateRange,
} from "../../../features/book-analytics/dateRange";
import AnalyticsDateRangeFilter from "../../../features/dashboard/components/AnalyticsDateRangeFilter";
import AnalyticsOverviewSection from "../../../features/dashboard/components/AnalyticsOverviewSection";
import AnalyticsSourceBreakdownSection from "../../../features/dashboard/components/AnalyticsSourceBreakdownSection";
import AnalyticsTrendChartsSection from "../../../features/dashboard/components/AnalyticsTrendChartsSection";
import TopBooksByClicksSection from "../../../features/dashboard/components/TopBooksByClicksSection";
import TopBooksByFavoritesSection from "../../../features/dashboard/components/TopBooksByFavoritesSection";
import TopBooksByViewsSection from "../../../features/dashboard/components/TopBooksByViewsSection";
import CreatorDashboardShell from "../../../features/dashboard/components/CreatorDashboardShell";
import { getPendingClaim } from "../../../features/claims/services";
import { paginationRequestBaseUrl } from "../../../lib/pagination";
import InfoPage from "../../../pages/InfoPage";
import PageHeader from "@/components/app/PageHeader";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;

  if (!user.creator) {
    return c.html(<InfoPage errorMessage="Creator not found" />);
  }

  const creator = user.creator;
  const scope = { creatorId: creator.id, creatorType: creator.type };

  const [claimError, claim] = await getPendingClaim(user.id, creator.id);
  if (claimError) {
    return c.html(<InfoPage errorMessage={claimError.reason} user={user} />);
  }

  const viewsPage = Number(c.req.query("viewsPage") ?? 1);
  const bookPage = Number(c.req.query("bookPage") ?? 1);
  const favoritesPage = Number(c.req.query("favoritesPage") ?? 1);

  const viewsPaginationBaseUrl = paginationRequestBaseUrl(
    c.req.url,
    "viewsPage",
  );
  const bookPaginationBaseUrl = paginationRequestBaseUrl(c.req.url, "bookPage");
  const favoritesPaginationBaseUrl = paginationRequestBaseUrl(
    c.req.url,
    "favoritesPage",
  );

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
      <CreatorDashboardShell
        currentPath={currentPath}
        user={user}
        claimStatus={claim?.status ?? null}
      >
        <PageHeader title="Analytics" intro="Check out your book analytics." />
        <div class="flex flex-col gap-6">
          <AnalyticsDateRangeFilter
            dateRange={dateRange}
            basePath="/dashboard/analytics"
            partialUpdateTarget="creator-dashboard-panel nav-tabs"
          />
        </div>
        <AnalyticsOverviewSection scope={scope} dateRange={dateRange} />
        <AnalyticsTrendChartsSection
          scope={scope}
          chartRange={chartRange}
          dateRange={dateRange}
        />
        <AnalyticsSourceBreakdownSection scope={scope} dateRange={dateRange} />
        <TopBooksByViewsSection
          scope={scope}
          dateRange={dateRange}
          currentPath={viewsPaginationBaseUrl}
          currentPage={viewsPage}
          pageParam="viewsPage"
        />
        <TopBooksByClicksSection
          scope={scope}
          dateRange={dateRange}
          currentPath={bookPaginationBaseUrl}
          currentPage={bookPage}
          pageParam="bookPage"
        />
        <TopBooksByFavoritesSection
          scope={scope}
          dateRange={dateRange}
          currentPath={favoritesPaginationBaseUrl}
          currentPage={favoritesPage}
          pageParam="favoritesPage"
        />
      </CreatorDashboardShell>
    </AppLayout>,
  );
});
