import TopCreatorsByFollowsTable from "./TopCreatorsByFollowsTable";
import TopBooksByFavoritesSection from "../../../components/TopBooksByFavoritesSection";
import TopBooksByViewsSection from "../../../components/TopBooksByViewsSection";
import AnalyticsOverviewSection from "../../../components/AnalyticsOverviewSection";
import AnalyticsTrendChartsSection from "../../../components/AnalyticsTrendChartsSection";
import AnalyticsSourceBreakdownSection from "../../../components/AnalyticsSourceBreakdownSection";
import TopBooksByClicksSection from "../../../components/TopBooksByClicksSection";
import TopCreatorsTable from "./TopCreatorsTable";
import { AnalyticsDateRange } from "../../../../book-analytics/dateRange";
import TopCreatorsByViews from "../../../components/TopCreatorsByViews";
import {
  ADMIN_ANALYTICS_FANS_PATH,
  ADMIN_ANALYTICS_VERIFIED_CREATORS_PATH,
} from "../adminAnalyticsPanel";

type Props = {
  dateRange: AnalyticsDateRange | null;
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
  chartRange: AnalyticsDateRange;
};

const BookAnalyticsBlock = ({
  dateRange,
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
  chartRange,
}: Props) => {
  return (
    <>
      <AnalyticsOverviewSection
        dateRange={dateRange}
        fansHref={ADMIN_ANALYTICS_FANS_PATH}
        verifiedCreatorsHref={ADMIN_ANALYTICS_VERIFIED_CREATORS_PATH}
      />
      <AnalyticsTrendChartsSection
        chartRange={chartRange}
        dateRange={dateRange}
      />
      <AnalyticsSourceBreakdownSection dateRange={dateRange} />
      <TopCreatorsByViews
        dateRange={dateRange}
        currentPath={viewsPaginationBaseUrl}
        currentPage={viewsPage}
        pageParam="viewsPage"
        scope="publisher"
      />
      <TopCreatorsByViews
        dateRange={dateRange}
        currentPath={viewsPaginationBaseUrl}
        currentPage={viewsPage}
        pageParam="viewsPage"
        scope="artist"
      />
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
    </>
  );
};

export default BookAnalyticsBlock;
