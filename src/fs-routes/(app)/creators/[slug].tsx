import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../lib/validator";
import { slugSchema } from "../../../features/app/schema";
import { getIsMobile } from "../../../lib/device";
import { Context } from "hono";
import { getUser } from "../../../utils";
import { getBooksByCreatorSlug } from "../../../features/app/services";
import { maybeRecordCreatorView } from "../../../features/creator-views/record";
import InfoPage from "../../../pages/InfoPage";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import CreatorDetail from "../../../features/app/components/creatorPage/CreatorDetail";
import { canonicalUrl, creatorDescription, pageTitle } from "../../../lib/seo";
import { getUpcomingFairsForCreator } from "../../../features/app/fairs/services";
import { routeParam } from "../../../lib/routeParam";
import { setAnonPageCache } from "../../../lib/staticCache";
import { countCreatorPosts } from "../../../db/queries";

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

    const [, postCount] = await Promise.all([
      maybeRecordCreatorView(c, creator, "web"),
      countCreatorPosts(creator.id),
    ]);

    let upcomingFairs: Awaited<
      ReturnType<typeof getUpcomingFairsForCreator>
    >[1] = [];
    const [fairsError, fairsResult] = await getUpcomingFairsForCreator(
      creator.id,
    );
    if (!fairsError && fairsResult) {
      upcomingFairs = fairsResult;
    }

    setAnonPageCache(c, user);

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
            postCount={postCount}
            upcomingFairs={upcomingFairs}
          />
        </Page>
      </AppLayout>,
    );
  },
);
