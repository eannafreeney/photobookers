import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import AnalyticsDateRangeFilter from "../../../components/AnalyticsDateRangeFilter.js";
import {
  ADMIN_ANALYTICS_BASE_PATH,
  ADMIN_ANALYTICS_FRAGMENT,
  ADMIN_ANALYTICS_PANEL_ID
} from "../adminAnalyticsPanel.js";
import AnalyticsSectionTabs from "./AnalyticsSectionTabs.js";
import BookAnalyticsBlock from "./BookAnalyticsBlock.js";
import CeoMetricsBlock from "./CeoMetricsBlock.js";
import SiteTrafficBlock from "./SiteTrafficBlock.js";
import AppAnalyticsBlock from "./AppAnalyticsBlock.js";
import NewsletterAnalyticsBlock from "./NewsletterAnalyticsBlock.js";
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
  followsPage
}) => {
  const bookDateRange = dateRange ?? chartRange;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      id: ADMIN_ANALYTICS_PANEL_ID,
      "x-merge": "replace",
      class: "flex flex-col gap-12",
      children: [
        /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-6", children: [
          /* @__PURE__ */ jsx(AnalyticsSectionTabs, { activeTab: tab, dateRange }),
          /* @__PURE__ */ jsx(
            AnalyticsDateRangeFilter,
            {
              dateRange,
              basePath: ADMIN_ANALYTICS_BASE_PATH,
              tab: tab === "site" || tab === "app" || tab === "newsletter" || tab === "books" ? tab : void 0,
              partialUpdateTarget: ADMIN_ANALYTICS_PANEL_ID,
              fragment: ADMIN_ANALYTICS_FRAGMENT
            }
          )
        ] }),
        tab === "overview" ? /* @__PURE__ */ jsx(CeoMetricsBlock, { dateRange }) : tab === "books" ? /* @__PURE__ */ jsx(
          BookAnalyticsBlock,
          {
            dateRange: bookDateRange,
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
          }
        ) : tab === "site" ? /* @__PURE__ */ jsx(SiteTrafficBlock, { dateRange }) : tab === "app" ? /* @__PURE__ */ jsx(AppAnalyticsBlock, { dateRange }) : /* @__PURE__ */ jsx(NewsletterAnalyticsBlock, { dateRange })
      ]
    }
  );
};
var AdminAnalyticsPanel_default = AdminAnalyticsPanel;
export {
  AdminAnalyticsPanel_default as default
};
