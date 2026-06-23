import { createRoute } from "hono-fsr";
import { Context } from "hono";
import AppLayout from "../../components/layouts/AppLayout";
import { getUser } from "../../utils";
import Page from "../../components/layouts/Page";
import PageHeader from "../../components/app/PageHeader";
import { isFeatureEnabledForUser } from "../../lib/features";
import InfoPage from "../../pages/InfoPage";
import {
  getUpcomingFairs,
  getCurrentFairs,
  getPastFairs,
  getFairsByMonth,
  searchFairs,
} from "../../features/app/fairs/services";
import FairsWithTabs from "../../features/app/fairs/components/FairsWithTabs";
import FairsCalendar from "../../features/app/fairs/components/FairsCalendar";
import FairsGrid from "../../features/app/fairs/components/FairsGrid";
import { pageTitle, canonicalUrl } from "../../lib/seo";
import SectionTitle from "../../components/app/SectionTitle";
import ViewAllLink from "../../features/app/components/ViewAllLink";

type ViewSwitcherProps = {
  currentView: "grid" | "calendar";
  baseUrl: string;
};

const ViewSwitcher = ({ currentView, baseUrl }: ViewSwitcherProps) => (
  <div class="flex gap-2 mb-4" id="fairs-content">
    <a
      href={`${baseUrl}?view=grid`}
      x-target="fairs-content"
      class={`px-4 py-2 text-sm rounded border transition-colors ${
        currentView === "grid"
          ? "border-accent bg-accent text-on-accent"
          : "border-outline hover:border-accent"
      }`}
    >
      Grid View
    </a>
    <a
      href={`${baseUrl}?view=calendar`}
      x-target="fairs-content"
      class={`px-4 py-2 text-sm rounded border transition-colors ${
        currentView === "calendar"
          ? "border-accent bg-accent text-on-accent"
          : "border-outline hover:border-accent"
      }`}
    >
      Calendar View
    </a>
  </div>
);

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;

  if (!isFeatureEnabledForUser("fairs", user)) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }

  const view = (c.req.query("view") ?? "grid") as "grid" | "calendar";
  const tab = (c.req.query("tab") ?? "upcoming") as
    | "upcoming"
    | "current"
    | "past";
  const page = Number(c.req.query("page") ?? 1);

  // Search parameters
  const query = c.req.query("query") || "";
  const city = c.req.query("city") || "";
  const country = c.req.query("country") || "";
  const startDate = c.req.query("startDate") || "";
  const endDate = c.req.query("endDate") || "";
  const hasSearchParams = query || city || country || startDate || endDate;

  const title = pageTitle("Book Fairs");
  const description =
    "Discover upcoming photobook fairs around the world. Find events where publishers and artists showcase their latest work.";

  // Search view
  if (hasSearchParams) {
    const [error, result] = await searchFairs({
      query,
      city,
      country,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page,
      limit: 30,
    });

    if (error) {
      return c.html(<InfoPage errorMessage={error.reason} user={user} />, 500);
    }

    return c.html(
      <AppLayout
        title={title}
        description={description}
        canonicalUrl={canonicalUrl(c.req.url, "/fairs")}
        user={user}
        currentPath={currentPath}
      >
        <Page>
          <div class="flex items-end justify-between mb-3 mt-10 border-t-2 border-on-surface-strong pt-3">
            <SectionTitle className="mb-0" kicker="Days Out!">
              Book Fairs
            </SectionTitle>
          </div>
          {/* <FairsSearchForm
            query={query}
            city={city}
            country={country}
            startDate={startDate}
            endDate={endDate}
            baseUrl={currentPath}
          />
          {result.totalCount > 0 ? (
            <div class="mb-4 text-sm text-on-surface-muted">
              Found {result.totalCount} fair{result.totalCount === 1 ? "" : "s"}
            </div>
          ) : (
            <div class="mb-4 text-sm text-on-surface-muted">
              No fairs found matching your search criteria
            </div>
          )} */}
          <FairsGrid
            fairs={result.fairs}
            page={result.page}
            totalPages={result.totalPages}
            baseUrl={currentPath}
            isPaginated
          />
        </Page>
      </AppLayout>,
    );
  }

  // Calendar view
  if (view === "calendar") {
    const now = new Date();
    const year = Number(c.req.query("year") ?? now.getFullYear());
    const month = Number(c.req.query("month") ?? now.getMonth() + 1);

    const [error, fairs] = await getFairsByMonth(year, month);
    if (error) {
      return c.html(<InfoPage errorMessage={error.reason} user={user} />, 500);
    }

    const calendarContent = (
      <>
        <ViewSwitcher currentView="calendar" baseUrl={currentPath} />
        <FairsCalendar
          year={year}
          month={month}
          fairs={fairs}
          baseUrl={currentPath}
        />
      </>
    );

    // If it's an AJAX request, return just the content fragment
    if (c.req.header("X-Requested-With") === "XMLHttpRequest") {
      return c.html(calendarContent);
    }

    return c.html(
      <AppLayout
        title={title}
        description={description}
        canonicalUrl={canonicalUrl(c.req.url, "/fairs")}
        user={user}
        currentPath={currentPath}
      >
        <Page>
          <div class="flex items-end justify-between mb-3 mt-10 border-t-2 border-on-surface-strong pt-3">
            <SectionTitle className="mb-0" kicker="Days Out!">
              Book Fairs
            </SectionTitle>
          </div>
          <div id="fairs-content">{calendarContent}</div>
        </Page>
      </AppLayout>,
    );
  }

  // Grid view (default)
  let upcomingFairs, upcomingPage, upcomingTotalPages;
  let currentFairs, currentPage, currentTotalPages;
  let pastFairs, pastPage, pastTotalPages;

  if (tab === "upcoming") {
    const [error, result] = await getUpcomingFairs(page, 30);
    if (error) {
      return c.html(<InfoPage errorMessage={error.reason} user={user} />, 500);
    }
    upcomingFairs = result.fairs;
    upcomingPage = result.page;
    upcomingTotalPages = result.totalPages;
  } else if (tab === "current") {
    const [error, result] = await getCurrentFairs(page, 30);
    if (error) {
      return c.html(<InfoPage errorMessage={error.reason} user={user} />, 500);
    }
    currentFairs = result.fairs;
    currentPage = result.page;
    currentTotalPages = result.totalPages;
  } else {
    const [error, result] = await getPastFairs(page, 30);
    if (error) {
      return c.html(<InfoPage errorMessage={error.reason} user={user} />, 500);
    }
    pastFairs = result.fairs;
    pastPage = result.page;
    pastTotalPages = result.totalPages;
  }

  const gridContent = (
    <>
      <ViewSwitcher currentView="grid" baseUrl={currentPath} />
      <FairsWithTabs
        tab={tab}
        upcomingFairs={upcomingFairs}
        upcomingPage={upcomingPage}
        upcomingTotalPages={upcomingTotalPages}
        currentFairs={currentFairs}
        currentPage={currentPage}
        currentTotalPages={currentTotalPages}
        pastFairs={pastFairs}
        pastPage={pastPage}
        pastTotalPages={pastTotalPages}
        baseUrl={currentPath}
      />
    </>
  );

  // If it's an AJAX request, return just the content fragment
  if (c.req.header("X-Requested-With") === "XMLHttpRequest") {
    return c.html(gridContent);
  }

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, "/fairs")}
      user={user}
      currentPath={currentPath}
    >
      <Page>
        <div class="flex items-end justify-between mb-3 mt-10 border-t-2 border-on-surface-strong pt-3">
          <SectionTitle className="mb-0" kicker="Days Out!">
            Book Fairs
          </SectionTitle>
        </div>
        <div id="fairs-content">{gridContent}</div>
      </Page>
    </AppLayout>,
  );
});
