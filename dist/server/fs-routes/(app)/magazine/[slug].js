import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import AppLayout from "../../../components/layouts/AppLayout.js";
import Page from "../../../components/layouts/Page.js";
import { getPublishedIssueBySlug } from "../../../domain/magazine/queries.js";
import { isFeatureEnabledForUser } from "../../../lib/features.js";
import InfoPage from "../../../pages/InfoPage.js";
import { canonicalUrl, pageTitle, truncateDescription } from "../../../lib/seo.js";
import { heroLcpImageSources } from "../../../lib/imageUrl.js";
import { getUser } from "../../../utils.js";
import MagazineIssuePage3 from "../../../features/app/components/magazine/MagazineIssuePage3.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  if (!isFeatureEnabledForUser("magazine", user)) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Not found", user }), 404);
  }
  const slug = c.req.param("slug");
  if (!slug) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Not found", user }), 404);
  }
  const [error, issue] = await getPublishedIssueBySlug(slug);
  if (error) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: error.reason, user }));
  }
  if (!issue) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Not found", user }), 404);
  }
  const kicker = issue.kicker ?? (issue.issueNumber ? `Issue ${issue.issueNumber}` : "Magazine");
  const title = pageTitle(`${kicker}: ${issue.title}`);
  const description = truncateDescription(issue.subtitle ?? issue.title);
  const path = `/magazine/${issue.slug}`;
  const issueCanonicalUrl = canonicalUrl(c.req.url, path);
  const shareImage = issue.bannerUrl ?? issue.coverUrl ?? "";
  if (!user) {
    c.header("Vary", "Cookie");
    c.header(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=3600"
    );
  } else {
    c.header("Cache-Control", "private, no-store");
  }
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title,
        description,
        canonicalUrl: issueCanonicalUrl,
        currentPath: c.req.path,
        user,
        shareOg: {
          title,
          description,
          image: shareImage,
          url: issueCanonicalUrl
        },
        preloadLcpImage: shareImage ? heroLcpImageSources(shareImage) : void 0,
        children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(MagazineIssuePage3, { issue }) })
      }
    )
  );
});
export {
  GET
};
