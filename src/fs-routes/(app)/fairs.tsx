import { createRoute } from "hono-fsr";
import { Context } from "hono";
import AppLayout from "../../components/layouts/AppLayout";
import { getUser } from "../../utils";
import Page from "../../components/layouts/Page";
import PageHeader from "../../components/app/PageHeader";
import { isFeatureEnabledForUser } from "../../lib/features";
import InfoPage from "../../pages/InfoPage";
import { getUpcomingFairs, getPastFairs } from "../../features/app/fairs/services";
import FairsWithTabs from "../../features/app/fairs/components/FairsWithTabs";
import { pageTitle, canonicalUrl } from "../../lib/seo";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  
  if (!isFeatureEnabledForUser("fairs", user)) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }

  const tab = (c.req.query("tab") ?? "upcoming") as "upcoming" | "past";
  const page = Number(c.req.query("page") ?? 1);

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

  const title = pageTitle("Book Fairs");
  const description =
    "Discover upcoming photobook fairs around the world. Find events where publishers and artists showcase their latest work.";

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
