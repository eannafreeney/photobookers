import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../lib/validator.js";
import { slugSchema } from "../../../features/app/schema.js";
import { getIsMobile } from "../../../lib/device.js";
import { getUser } from "../../../utils.js";
import { getBooksByCreatorSlug } from "../../../features/app/services.js";
import { maybeRecordCreatorView } from "../../../features/creator-views/record.js";
import InfoPage from "../../../pages/InfoPage.js";
import AppLayout from "../../../components/layouts/AppLayout.js";
import Page from "../../../components/layouts/Page.js";
import CreatorDetail from "../../../features/app/components/CreatorDetail.js";
import { canonicalUrl, creatorDescription, pageTitle } from "../../../lib/seo.js";
import { getUpcomingFairsForCreator } from "../../../features/app/fairs/services.js";
import { isFeatureEnabledForUser } from "../../../lib/features.js";
import { routeParam } from "../../../lib/routeParam.js";
import { countCreatorPosts } from "../../../db/queries.js";
const GET = createRoute(
  paramValidator(slugSchema),
  async (c) => {
    const slug = routeParam(c, "slug");
    const user = await getUser(c);
    const currentPath = c.req.path;
    const currentPage = Number(c.req.query("page") ?? 1);
    const creatorsCurrentPage = Number(c.req.query("creatorsPage") ?? 1);
    const isMobile = getIsMobile(c.req.header("user-agent") ?? "");
    const [error, result] = await getBooksByCreatorSlug(slug, currentPage);
    if (error) {
      return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: error.reason, user }));
    }
    const { creator } = result;
    const [, postCount] = await Promise.all([
      maybeRecordCreatorView(c, creator, "web"),
      countCreatorPosts(creator.id)
    ]);
    let upcomingFairs = [];
    if (isFeatureEnabledForUser("fairs", user)) {
      const [fairsError, fairsResult] = await getUpcomingFairsForCreator(
        creator.id
      );
      if (!fairsError && fairsResult) {
        upcomingFairs = fairsResult;
      }
    }
    if (!user) {
      c.header("Vary", "Cookie");
      c.header(
        "Cache-Control",
        "private, max-age=120, stale-while-revalidate=600"
      );
    } else {
      c.header("Cache-Control", "private, no-store");
    }
    const title = pageTitle(creator.displayName);
    const description = creatorDescription(creator);
    const creatorCanonicalUrl = canonicalUrl(
      c.req.url,
      `/creators/${creator.slug}`
    );
    return c.html(
      /* @__PURE__ */ jsx(
        AppLayout,
        {
          title,
          description,
          canonicalUrl: creatorCanonicalUrl,
          user,
          currentPath,
          adminEditHref: `/dashboard/admin/creators/${creator.id}`,
          shareOg: {
            title,
            description,
            image: creator.coverUrl ?? void 0,
            url: creatorCanonicalUrl
          },
          children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(
            CreatorDetail,
            {
              creator,
              user,
              currentPath,
              result,
              creatorsCurrentPage,
              isMobile,
              postCount,
              upcomingFairs
            }
          ) })
        }
      )
    );
  }
);
export {
  GET
};
