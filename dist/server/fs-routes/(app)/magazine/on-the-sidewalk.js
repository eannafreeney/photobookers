import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import AppLayout from "../../../components/layouts/AppLayout.js";
import Page from "../../../components/layouts/Page.js";
import MagazineIssue01Page from "../../../features/app/components/magazine/MagazineIssue01Page.js";
import {
  issue01BookEntries,
  issue01Meta
} from "../../../features/app/content/magazine/issue01OnTheSidewalk.js";
import { getMagazineBooksBySlugs } from "../../../features/app/magazine/services.js";
import InfoPage from "../../../pages/InfoPage.js";
import { canonicalUrl, pageTitle, truncateDescription } from "../../../lib/seo.js";
import { heroLcpImageSources } from "../../../lib/imageUrl.js";
import { getUser } from "../../../utils.js";
const path = `/magazine/${issue01Meta.slug}`;
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const slugs = issue01BookEntries.map((entry) => entry.slug);
  const [booksError, books] = await getMagazineBooksBySlugs(slugs);
  if (booksError) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: booksError.reason, user }));
  }
  const title = pageTitle(`${issue01Meta.kicker}: ${issue01Meta.title}`);
  const description = truncateDescription(issue01Meta.subtitle);
  const issueCanonicalUrl = canonicalUrl(c.req.url, path);
  const shareImage = issue01Meta.coverUrl;
  if (!user) {
    c.header("Vary", "Cookie");
    c.header("Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
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
        currentPath,
        user,
        shareOg: {
          title,
          description,
          image: shareImage,
          url: issueCanonicalUrl
        },
        preloadLcpImage: heroLcpImageSources(shareImage),
        children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(MagazineIssue01Page, { books }) })
      }
    )
  );
});
export {
  GET
};
