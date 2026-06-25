import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../lib/validator";
import { slugSchema } from "../../../features/app/schema";
import { getIsMobile } from "../../../lib/device";
import { Context } from "hono";
import { getUser } from "../../../utils";
import { getBooksByCreatorSlug } from "../../../features/app/services";
import InfoPage from "../../../pages/InfoPage";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import CreatorDetail from "../../../features/app/components/CreatorDetail";
import { canonicalUrl, creatorDescription, pageTitle } from "../../../lib/seo";
import { getUpcomingFairsForCreator } from "../../../features/app/fairs/services";
import { isFeatureEnabledForUser } from "../../../lib/features";
import { routeParam } from "../../../lib/routeParam";

export const GET = createRoute(
  paramValidator(slugSchema),
  async (c: Context) => {
    const slug = routeParam(c, "slug");
    const user = await getUser(c);
    const currentPath = c.req.path;
    const currentPage = Number(c.req.query("page") ?? 1);
    const creatorsCurrentPage = Number(c.req.query("creatorsPage") ?? 1);
    const isMobile = getIsMobile(c.req.header("user-agent") ?? "");

    const [error, result] = await getBooksByCreatorSlug(slug, currentPage);

    if (error) {
      return c.html(<InfoPage errorMessage={error.reason} user={user} />);
    }

    const { creator } = result;

    // Fetch upcoming fairs if feature is enabled
    let upcomingFairs: Awaited<
      ReturnType<typeof getUpcomingFairsForCreator>
    >[1] = [];
    if (isFeatureEnabledForUser("fairs", user)) {
      const [fairsError, fairsResult] = await getUpcomingFairsForCreator(
        creator.id,
      );
      if (!fairsError && fairsResult) {
        upcomingFairs = fairsResult;
      }
    }

    if (!user) {
      c.header("Vary", "Cookie");
      c.header(
        "Cache-Control",
        "private, max-age=120, stale-while-revalidate=600",
      );
    } else {
      c.header("Cache-Control", "private, no-store");
    }

    const title = pageTitle(creator.displayName);
    const description = creatorDescription(creator);
    const creatorCanonicalUrl = canonicalUrl(
      c.req.url,
      `/creators/${creator.slug}`,
    );

    return c.html(
      <AppLayout
        title={title}
        description={description}
        canonicalUrl={creatorCanonicalUrl}
        user={user}
        currentPath={currentPath}
        adminEditHref={`/dashboard/admin/creators/${creator.id}`}
        shareOg={{
          title,
          description,
          image: creator.coverUrl ?? undefined,
          url: creatorCanonicalUrl,
        }}
      >
        <Page>
          <CreatorDetail
            creator={creator}
            user={user}
            currentPath={currentPath}
            result={result}
            creatorsCurrentPage={creatorsCurrentPage}
            isMobile={isMobile}
            upcomingFairs={upcomingFairs}
          />
        </Page>
      </AppLayout>,
    );
  },
);
