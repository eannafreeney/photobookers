import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import AppLayout from "../../../components/layouts/AppLayout.js";
import SectionTitle from "../../../components/app/SectionTitle.js";
import { getFlash, getUser } from "../../../utils.js";
import {
  parseAnalyticsDateRange,
  presetAnalyticsDateRange
} from "../../../features/book-analytics/dateRange.js";
import AnalyticsDateRangeFilter from "../../../features/dashboard/components/AnalyticsDateRangeFilter.js";
import AnalyticsOverviewSection from "../../../features/dashboard/components/AnalyticsOverviewSection.js";
import AnalyticsSourceBreakdownSection from "../../../features/dashboard/components/AnalyticsSourceBreakdownSection.js";
import AnalyticsTrendChartsSection from "../../../features/dashboard/components/AnalyticsTrendChartsSection.js";
import TopBooksByClicksSection from "../../../features/dashboard/components/TopBooksByClicksSection.js";
import TopBooksByFavoritesSection from "../../../features/dashboard/components/TopBooksByFavoritesSection.js";
import TopBooksByViewsSection from "../../../features/dashboard/components/TopBooksByViewsSection.js";
import CreatorDashboardShell from "../../../features/dashboard/components/CreatorDashboardShell.js";
import { getPendingClaim } from "../../../features/claims/services.js";
import { paginationRequestBaseUrl } from "../../../lib/pagination.js";
import InfoPage from "../../../pages/InfoPage.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  if (!user.creator) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Creator not found" }));
  }
  const creator = user.creator;
  const scope = { creatorId: creator.id, creatorType: creator.type };
  const [claimError, claim] = await getPendingClaim(user.id, creator.id);
  if (claimError) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: claimError.reason, user }));
  }
  const viewsPage = Number(c.req.query("viewsPage") ?? 1);
  const bookPage = Number(c.req.query("bookPage") ?? 1);
  const favoritesPage = Number(c.req.query("favoritesPage") ?? 1);
  const viewsPaginationBaseUrl = paginationRequestBaseUrl(
    c.req.url,
    "viewsPage"
  );
  const bookPaginationBaseUrl = paginationRequestBaseUrl(c.req.url, "bookPage");
  const favoritesPaginationBaseUrl = paginationRequestBaseUrl(
    c.req.url,
    "favoritesPage"
  );
  const dateRange = parseAnalyticsDateRange(
    c.req.query("from"),
    c.req.query("to")
  );
  const chartRange = dateRange ?? presetAnalyticsDateRange(30);
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Analytics",
        user,
        flash,
        currentPath,
        children: /* @__PURE__ */ jsx(
          CreatorDashboardShell,
          {
            currentPath,
            user,
            claimStatus: claim?.status ?? null,
            children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-12", children: [
              /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-6", children: [
                /* @__PURE__ */ jsx(SectionTitle, { children: "Book analytics" }),
                /* @__PURE__ */ jsx(
                  AnalyticsDateRangeFilter,
                  {
                    dateRange,
                    basePath: "/dashboard/analytics",
                    partialUpdateTarget: "creator-dashboard-panel nav-tabs"
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(AnalyticsOverviewSection, { scope, dateRange }),
              /* @__PURE__ */ jsx(
                AnalyticsTrendChartsSection,
                {
                  scope,
                  chartRange,
                  dateRange
                }
              ),
              /* @__PURE__ */ jsx(
                AnalyticsSourceBreakdownSection,
                {
                  scope,
                  dateRange
                }
              ),
              /* @__PURE__ */ jsx(
                TopBooksByViewsSection,
                {
                  scope,
                  dateRange,
                  currentPath: viewsPaginationBaseUrl,
                  currentPage: viewsPage,
                  pageParam: "viewsPage"
                }
              ),
              /* @__PURE__ */ jsx(
                TopBooksByClicksSection,
                {
                  scope,
                  dateRange,
                  currentPath: bookPaginationBaseUrl,
                  currentPage: bookPage,
                  pageParam: "bookPage"
                }
              ),
              /* @__PURE__ */ jsx(
                TopBooksByFavoritesSection,
                {
                  scope,
                  dateRange,
                  currentPath: favoritesPaginationBaseUrl,
                  currentPage: favoritesPage,
                  pageParam: "favoritesPage"
                }
              )
            ] })
          }
        )
      }
    )
  );
});
export {
  GET
};
