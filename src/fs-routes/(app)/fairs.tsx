import { createRoute } from "hono-fsr";
import { Context } from "hono";
import AppLayout from "../../components/layouts/AppLayout";
import { getUser } from "../../utils";
import Page from "../../components/layouts/Page";
import PageHeader from "../../components/app/PageHeader";
import { isFeatureEnabledForUser } from "../../lib/features";
import InfoPage from "../../pages/InfoPage";
import { getUpcomingFairs, getPastFairs, getFairsByMonth, searchFairs } from "../../features/app/fairs/services";
import FairsWithTabs from "../../features/app/fairs/components/FairsWithTabs";
import FairsCalendar from "../../features/app/fairs/components/FairsCalendar";
import FairsSearchForm from "../../features/app/fairs/components/FairsSearchForm";
import FairsGrid from "../../features/app/fairs/components/FairsGrid";
import Link from "../../components/app/Link";
import { pageTitle, canonicalUrl } from "../../lib/seo";

type ViewSwitcherProps = {
  currentView: "grid" | "calendar";
  baseUrl: string;
};

const ViewSwitcher = ({ currentView, baseUrl }: ViewSwitcherProps) => (
  <div class="flex gap-2 mb-4">
    <Link
      href={`${baseUrl}?view=grid`}
      className={`px-4 py-2 text-sm rounded border transition-colors ${
        currentView === "grid"
          ? "border-accent bg-accent text-on-accent"
          : "border-outline hover:border-accent"
      }`}
    >
      Grid View
    </Link>
    <Link
      href={`${baseUrl}?view=calendar`}
      className={`px-4 py-2 text-sm rounded border transition-colors ${
        currentView === "calendar"
          ? "border-accent bg-accent text-on-accent"
          : "border-outline hover:border-accent"
      }`}
    >
      Calendar View
    </Link>
  </div>
);

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  
  if (!isFeatureEnabledForUser("fairs", user)) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }

  const view = (c.req.query("view") ?? "grid") as "grid" | "calendar";
  const tab = (c.req.query("tab") ?? "upcoming") as "upcoming" | "past";
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
      return c.html(
        <InfoPage errorMessage={error.reason} user={user} />,
        500,
      );
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
          <PageHeader
            title="Book Fairs"
            intro="Discover photobook fairs around the world"
          />
          <FairsSearchForm
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
          )}
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
      return c.html(
        <InfoPage errorMessage={error.reason} user={user} />,
        500,
      );
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
          <PageHeader
            title="Book Fairs"
            intro="Discover photobook fairs around the world"
          />
          <FairsSearchForm
            baseUrl={currentPath}
          />
          <ViewSwitcher currentView="calendar" baseUrl={currentPath} />
          <FairsCalendar
            year={year}
            month={month}
            fairs={fairs}
            baseUrl={currentPath}
          />
        </Page>
      </AppLayout>,
    );
  }

  // Grid view (default)
  let upcomingFairs, upcomingPage, upcomingTotalPages;
  let pastFairs, pastPage, pastTotalPages;

  if (tab === "upcoming") {
    const [error, result] = await getUpcomingFairs(page, 30);
    if (error) {
      return c.html(
        <InfoPage errorMessage={error.reason} user={user} />,
        500,
      );
    }
    upcomingFairs = result.fairs;
    upcomingPage = result.page;
    upcomingTotalPages = result.totalPages;
  } else {
    const [error, result] = await getPastFairs(page, 30);
    if (error) {
      return c.html(
        <InfoPage errorMessage={error.reason} user={user} />,
        500,
      );
    }
    pastFairs = result.fairs;
    pastPage = result.page;
    pastTotalPages = result.totalPages;
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
        <PageHeader
          title="Book Fairs"
          intro="Discover photobook fairs around the world"
        />
        <FairsSearchForm
          baseUrl={currentPath}
        />
        <ViewSwitcher currentView="grid" baseUrl={currentPath} />
        <FairsWithTabs
          tab={tab}
          upcomingFairs={upcomingFairs}
          upcomingPage={upcomingPage}
          upcomingTotalPages={upcomingTotalPages}
          pastFairs={pastFairs}
          pastPage={pastPage}
          pastTotalPages={pastTotalPages}
          baseUrl={currentPath}
        />
      </Page>
    </AppLayout>,
  );
});
