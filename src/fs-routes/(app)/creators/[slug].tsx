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

export const GET = createRoute(
  paramValidator(slugSchema),
  async (c: Context) => {
    const slug = c.req.param("slug");
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
          />
        </Page>
      </AppLayout>,
    );
  },
);
