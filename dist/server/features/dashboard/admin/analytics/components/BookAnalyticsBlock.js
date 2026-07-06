import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import TopCreatorsByFollowsTable from "./TopCreatorsByFollowsTable.js";
import TopBooksByFavoritesSection from "../../../components/TopBooksByFavoritesSection.js";
import TopBooksByViewsSection from "../../../components/TopBooksByViewsSection.js";
import AnalyticsOverviewSection from "../../../components/AnalyticsOverviewSection.js";
import AnalyticsTrendChartsSection from "../../../components/AnalyticsTrendChartsSection.js";
import AnalyticsSourceBreakdownSection from "../../../components/AnalyticsSourceBreakdownSection.js";
import TopBooksByClicksSection from "../../../components/TopBooksByClicksSection.js";
import TopCreatorsTable from "./TopCreatorsTable.js";
import TopCreatorsByViews from "../../../components/TopCreatorsByViews.js";
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
  chartRange
}) => {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(AnalyticsOverviewSection, { dateRange }),
    /* @__PURE__ */ jsx(
      AnalyticsTrendChartsSection,
      {
        chartRange,
        dateRange
      }
    ),
    /* @__PURE__ */ jsx(AnalyticsSourceBreakdownSection, { dateRange }),
    /* @__PURE__ */ jsx(
      TopCreatorsByViews,
      {
        dateRange,
        currentPath: viewsPaginationBaseUrl,
        currentPage: viewsPage,
        pageParam: "viewsPage",
        scope: "publisher"
      }
    ),
    /* @__PURE__ */ jsx(
      TopCreatorsByViews,
      {
        dateRange,
        currentPath: viewsPaginationBaseUrl,
        currentPage: viewsPage,
        pageParam: "viewsPage",
        scope: "artist"
      }
    ),
    /* @__PURE__ */ jsx(
      TopBooksByViewsSection,
      {
        dateRange,
        currentPath: viewsPaginationBaseUrl,
        currentPage: viewsPage,
        pageParam: "viewsPage"
      }
    ),
    /* @__PURE__ */ jsx(
      TopBooksByClicksSection,
      {
        dateRange,
        currentPath: bookPaginationBaseUrl,
        currentPage: bookPage,
        pageParam: "bookPage"
      }
    ),
    /* @__PURE__ */ jsx(
      TopCreatorsTable,
      {
        role: "publisher",
        title: "Top publishers",
        dateRange,
        currentPath: publisherPaginationBaseUrl,
        currentPage: publisherPage,
        pageParam: "publisherPage"
      }
    ),
    /* @__PURE__ */ jsx(
      TopCreatorsTable,
      {
        role: "artist",
        title: "Top artists",
        dateRange,
        currentPath: artistPaginationBaseUrl,
        currentPage: artistPage,
        pageParam: "artistPage"
      }
    ),
    /* @__PURE__ */ jsx(
      TopBooksByFavoritesSection,
      {
        dateRange,
        currentPath: favoritesPaginationBaseUrl,
        currentPage: favoritesPage,
        pageParam: "favoritesPage"
      }
    ),
    /* @__PURE__ */ jsx(
      TopCreatorsByFollowsTable,
      {
        dateRange,
        currentPath: followsPaginationBaseUrl,
        currentPage: followsPage,
        pageParam: "followsPage"
      }
    )
  ] });
};
var BookAnalyticsBlock_default = BookAnalyticsBlock;
export {
  BookAnalyticsBlock_default as default
};
