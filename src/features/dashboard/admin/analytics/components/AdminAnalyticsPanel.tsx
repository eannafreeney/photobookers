import type { AnalyticsDateRange } from "../../../../book-analytics/dateRange";
import AnalyticsDateRangeFilter from "../../../components/AnalyticsDateRangeFilter";
import {
  ADMIN_ANALYTICS_BASE_PATH,
  ADMIN_ANALYTICS_FRAGMENT,
  ADMIN_ANALYTICS_PANEL_ID,
} from "../adminAnalyticsPanel";
import AnalyticsSectionTabs, {
  type AnalyticsSectionTab,
} from "./AnalyticsSectionTabs";
import BookAnalyticsBlock from "./BookAnalyticsBlock";
import CeoMetricsBlock from "./CeoMetricsBlock";
import SiteTrafficBlock from "./SiteTrafficBlock";
import AppAnalyticsBlock from "./AppAnalyticsBlock";
import NewsletterAnalyticsBlock from "./NewsletterAnalyticsBlock";

type Props = {
  tab: AnalyticsSectionTab;
  dateRange: AnalyticsDateRange | null;
  chartRange: AnalyticsDateRange;
  viewsPaginationBaseUrl: string;
  viewsPage: number;
  bookPaginationBaseUrl: string;
  bookPage: number;
  publisherPaginationBaseUrl: string;
  publisherPage: number;
  artistPaginationBaseUrl: string;
  artistPage: number;
  favoritesPaginationBaseUrl: string;
  favoritesPage: number;
  followsPaginationBaseUrl: string;
  followsPage: number;
};

const AdminAnalyticsPanel = async ({
  tab,
  dateRange,
  chartRange,
  viewsPaginationBaseUrl,
  viewsPage,
  bookPaginationBaseUrl,
  bookPage,
  publisherPaginationBaseUrl,
  publisherPage,
  artistPaginationBaseUrl,
  artistPage,
  favoritesPaginationBaseUrl,
  favoritesPage,
  followsPaginationBaseUrl,
  followsPage,
}: Props) => {
  return (
    <div
      id={ADMIN_ANALYTICS_PANEL_ID}
      x-merge="replace"
      class="flex flex-col gap-12"
    >
      <div class="flex flex-col gap-6">
        <AnalyticsSectionTabs activeTab={tab} dateRange={dateRange} />
        <AnalyticsDateRangeFilter
          dateRange={dateRange}
          basePath={ADMIN_ANALYTICS_BASE_PATH}
          tab={
            tab === "site" ||
            tab === "app" ||
            tab === "newsletter" ||
            tab === "books"
              ? tab
              : undefined
          }
          partialUpdateTarget={ADMIN_ANALYTICS_PANEL_ID}
          fragment={ADMIN_ANALYTICS_FRAGMENT}
        />
      </div>
      {tab === "overview" ? (
        <CeoMetricsBlock dateRange={dateRange} />
      ) : tab === "books" ? (
        <BookAnalyticsBlock
          dateRange={dateRange}
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
          chartRange={chartRange}
        />
      ) : tab === "site" ? (
        <SiteTrafficBlock dateRange={dateRange} />
      ) : tab === "app" ? (
        <AppAnalyticsBlock dateRange={dateRange} />
      ) : (
        <NewsletterAnalyticsBlock dateRange={dateRange} />
      )}
    </div>
  );
};

export default AdminAnalyticsPanel;
