import { createRoute } from "hono-fsr";
import AppLayout from "@/components/layouts/AppLayout";
import Page from "@/components/layouts/Page";
import MagazineIssue01Page from "@/features/app/components/magazine/MagazineIssue01Page";
import {
  issue01BookEntries,
  issue01Meta,
} from "@/features/app/content/magazine/issue01OnTheSidewalk";
import { getMagazineBooksBySlugs } from "@/features/app/magazine/services";
import InfoPage from "@/pages/InfoPage";
import { canonicalUrl, pageTitle, truncateDescription } from "@/lib/seo";
import { heroLcpImageSources } from "@/lib/imageUrl";
import { getUser } from "@/utils";

const path = `/magazine/${issue01Meta.slug}`;

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;

  const slugs = issue01BookEntries.map((entry) => entry.slug);
  const [booksError, books] = await getMagazineBooksBySlugs(slugs);
  if (booksError) {
    return c.html(<InfoPage errorMessage={booksError.reason} user={user} />);
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
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={issueCanonicalUrl}
      currentPath={currentPath}
      user={user}
      shareOg={{
        title,
        description,
        image: shareImage,
        url: issueCanonicalUrl,
      }}
      preloadLcpImage={heroLcpImageSources(shareImage)}
    >
      <Page>
        <MagazineIssue01Page books={books} />
      </Page>
    </AppLayout>,
  );
});
