import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import AppLayout from "../../components/layouts/AppLayout.js";
import { getUser } from "../../utils.js";
import Page from "../../components/layouts/Page.js";
import PageHeader from "../../components/app/PageHeader.js";
import { isFeatureEnabledForUser } from "../../lib/features.js";
import InfoPage from "../../pages/InfoPage.js";
import {
  getUpcomingFairs,
  getCurrentFairs,
  getPastFairs,
  getFairsByMonth,
  searchFairs
} from "../../features/app/fairs/services.js";
import FairsWithTabs from "../../features/app/fairs/components/FairsWithTabs.js";
import FairsCalendar from "../../features/app/fairs/components/FairsCalendar.js";
import FairsGrid from "../../features/app/fairs/components/FairsGrid.js";
import { pageTitle, canonicalUrl } from "../../lib/seo.js";
import SectionTitle from "../../components/app/SectionTitle.js";
import FairsSearchForm from "../../features/app/fairs/components/FairsSearchForm.js";
const ViewSwitcher = ({ currentView, baseUrl }) => /* @__PURE__ */ jsxs("div", { class: "flex gap-2 mb-4", id: "fairs-content", children: [
  /* @__PURE__ */ jsx(
    "a",
    {
      href: `${baseUrl}?view=grid`,
      "x-target": "fairs-content",
      class: `px-4 py-2 text-sm rounded border transition-colors ${currentView === "grid" ? "border-accent bg-accent text-on-accent" : "border-outline hover:border-accent"}`,
      children: "Grid View"
    }
  ),
  /* @__PURE__ */ jsx(
    "a",
    {
      href: `${baseUrl}?view=calendar`,
      "x-target": "fairs-content",
      class: `px-4 py-2 text-sm rounded border transition-colors ${currentView === "calendar" ? "border-accent bg-accent text-on-accent" : "border-outline hover:border-accent"}`,
      children: "Calendar View"
    }
  )
] });
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  if (!isFeatureEnabledForUser("fairs", user)) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Not found", user }), 404);
  }
  const view = c.req.query("view") ?? "grid";
  const tab = c.req.query("tab") ?? "upcoming";
  const page = Number(c.req.query("page") ?? 1);
  const query = c.req.query("query") || "";
  const city = c.req.query("city") || "";
  const country = c.req.query("country") || "";
  const startDate = c.req.query("startDate") || "";
  const endDate = c.req.query("endDate") || "";
  const hasSearchParams = query || city || country || startDate || endDate;
  const title = pageTitle("Book Fairs");
  const description = "Discover upcoming photobook fairs around the world. Find events where publishers and artists showcase their latest work.";
  if (hasSearchParams) {
    const [error, result] = await searchFairs({
      query,
      city,
      country,
      startDate: startDate ? new Date(startDate) : void 0,
      endDate: endDate ? new Date(endDate) : void 0,
      page,
      limit: 30
    });
    if (error) {
      return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: error.reason, user }), 500);
    }
    return c.html(
      /* @__PURE__ */ jsx(
        AppLayout,
        {
          title,
          description,
          canonicalUrl: canonicalUrl(c.req.url, "/fairs"),
          user,
          currentPath,
          children: /* @__PURE__ */ jsxs(Page, { children: [
            /* @__PURE__ */ jsx("div", { class: "flex items-end justify-between mb-3 mt-10 border-t-2 border-on-surface-strong pt-3", children: /* @__PURE__ */ jsx(SectionTitle, { className: "mb-0", kicker: "Days Out!", children: "Book Fairs" }) }),
            /* @__PURE__ */ jsx(
              FairsSearchForm,
              {
                query,
                city,
                country,
                startDate,
                endDate,
                baseUrl: currentPath
              }
            ),
            result.totalCount > 0 ? /* @__PURE__ */ jsxs("div", { class: "mb-4 text-sm text-on-surface-muted", children: [
              "Found ",
              result.totalCount,
              " fair",
              result.totalCount === 1 ? "" : "s"
            ] }) : /* @__PURE__ */ jsx("div", { class: "mb-4 text-sm text-on-surface-muted", children: "No fairs found matching your search criteria" }),
            /* @__PURE__ */ jsx(
              FairsGrid,
              {
                fairs: result.fairs,
                page: result.page,
                totalPages: result.totalPages,
                baseUrl: currentPath,
                isPaginated: true
              }
            )
          ] })
        }
      )
    );
  }
  if (view === "calendar") {
    const now = /* @__PURE__ */ new Date();
    const year = Number(c.req.query("year") ?? now.getFullYear());
    const month = Number(c.req.query("month") ?? now.getMonth() + 1);
    const [error, fairs] = await getFairsByMonth(year, month);
    if (error) {
      return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: error.reason, user }), 500);
    }
    const calendarContent = /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        FairsSearchForm,
        {
          query,
          city,
          country,
          startDate,
          endDate,
          baseUrl: currentPath
        }
      ),
      /* @__PURE__ */ jsx(ViewSwitcher, { currentView: "calendar", baseUrl: currentPath }),
      /* @__PURE__ */ jsx(
        FairsCalendar,
        {
          year,
          month,
          fairs,
          baseUrl: currentPath
        }
      )
    ] });
    if (c.req.header("X-Requested-With") === "XMLHttpRequest") {
      return c.html(calendarContent);
    }
    return c.html(
      /* @__PURE__ */ jsx(
        AppLayout,
        {
          title,
          description,
          canonicalUrl: canonicalUrl(c.req.url, "/fairs"),
          user,
          currentPath,
          children: /* @__PURE__ */ jsxs(Page, { children: [
            /* @__PURE__ */ jsx("div", { class: "flex items-end justify-between mb-3 mt-10 border-t-2 border-on-surface-strong pt-3", children: /* @__PURE__ */ jsx(SectionTitle, { className: "mb-0", kicker: "Days Out!", children: "Book Fairs" }) }),
            /* @__PURE__ */ jsx("div", { id: "fairs-content", children: calendarContent })
          ] })
        }
      )
    );
  }
  const upcomingPageNum = tab === "upcoming" ? page : 1;
  const currentPageNum = tab === "current" ? page : 1;
  const pastPageNum = tab === "past" ? page : 1;
  const [
    [upcomingError, upcomingResult],
    [currentError, currentResult],
    [pastError, pastResult]
  ] = await Promise.all([
    getUpcomingFairs(upcomingPageNum, 30),
    getCurrentFairs(currentPageNum, 30),
    getPastFairs(pastPageNum, 30)
  ]);
  if (upcomingError || currentError || pastError) {
    const error = upcomingError ?? currentError ?? pastError;
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: error.reason, user }), 500);
  }
  const upcomingFairs = upcomingResult.fairs;
  const upcomingPage = upcomingResult.page;
  const upcomingTotalPages = upcomingResult.totalPages;
  const currentFairs = currentResult.fairs;
  const currentPage = currentResult.page;
  const currentTotalPages = currentResult.totalPages;
  const pastFairs = pastResult.fairs;
  const pastPage = pastResult.page;
  const pastTotalPages = pastResult.totalPages;
  const gridContent = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      FairsSearchForm,
      {
        query,
        city,
        country,
        startDate,
        endDate,
        baseUrl: currentPath
      }
    ),
    /* @__PURE__ */ jsx(ViewSwitcher, { currentView: "grid", baseUrl: currentPath }),
    /* @__PURE__ */ jsx(
      FairsWithTabs,
      {
        tab,
        upcomingFairs,
        upcomingPage,
        upcomingTotalPages,
        currentFairs,
        currentPage,
        currentTotalPages,
        pastFairs,
        pastPage,
        pastTotalPages,
        baseUrl: currentPath
      }
    )
  ] });
  if (c.req.header("X-Requested-With") === "XMLHttpRequest") {
    return c.html(gridContent);
  }
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title,
        description,
        canonicalUrl: canonicalUrl(c.req.url, "/fairs"),
        user,
        currentPath,
        children: /* @__PURE__ */ jsxs(Page, { children: [
          /* @__PURE__ */ jsx(
            PageHeader,
            {
              kicker: "Days Out!",
              title: "Book Fairs",
              intro: "Discover upcoming photobook fairs around the world. Find events where publishers and artists showcase their latest work."
            }
          ),
          /* @__PURE__ */ jsx("div", { id: "fairs-content", children: gridContent })
        ] })
      }
    )
  );
});
export {
  GET
};
