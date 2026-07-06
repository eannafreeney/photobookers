import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import Page from "../../../../components/layouts/Page.js";
import Sidebar from "../../../../components/app/Sidebar.js";
import SectionTitle from "../../../../components/app/SectionTitle.js";
import { getFlash, getUser } from "../../../../utils.js";
import {
  parseAnalyticsDateRange,
  presetAnalyticsDateRange
} from "../../../../features/book-analytics/dateRange.js";
import AdminAnalyticsPanel from "../../../../features/dashboard/admin/analytics/components/AdminAnalyticsPanel.js";
import { parseAnalyticsSectionTab } from "../../../../features/dashboard/admin/analytics/components/AnalyticsSectionTabs.js";
import { ADMIN_ANALYTICS_FRAGMENT } from "../../../../features/dashboard/admin/analytics/adminAnalyticsPanel.js";
import { paginationRequestBaseUrl } from "../../../../lib/pagination.js";
const GET = createRoute(async (c) => {
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
    "viewsPage"
  );
  const bookPaginationBaseUrl = paginationRequestBaseUrl(c.req.url, "bookPage");
  const publisherPaginationBaseUrl = paginationRequestBaseUrl(
    c.req.url,
    "publisherPage"
  );
  const artistPaginationBaseUrl = paginationRequestBaseUrl(
    c.req.url,
    "artistPage"
  );
  const favoritesPaginationBaseUrl = paginationRequestBaseUrl(
    c.req.url,
    "favoritesPage"
  );
  const followsPaginationBaseUrl = paginationRequestBaseUrl(
    c.req.url,
    "followsPage"
  );
  const currentPath = c.req.path;
  const dateRange = parseAnalyticsDateRange(
    c.req.query("from"),
    c.req.query("to")
  );
  const chartRange = dateRange ?? presetAnalyticsDateRange(30);
  const tab = parseAnalyticsSectionTab(c.req.query("tab"));
  const panel = /* @__PURE__ */ jsx(
    AdminAnalyticsPanel,
    {
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
    }
  );
  if (c.req.query("fragment") === ADMIN_ANALYTICS_FRAGMENT) {
    return c.html(panel);
  }
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Analytics",
        user,
        flash,
        currentPath,
        children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(Sidebar, { currentPath, children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-12", children: [
          /* @__PURE__ */ jsx(SectionTitle, { children: "Analytics" }),
          panel
        ] }) }) })
      }
    )
  );
});
export {
  GET
};
