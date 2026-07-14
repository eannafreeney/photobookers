import { createRoute } from "hono-fsr";
import AppLayout from "@/components/layouts/AppLayout";
import Page from "@/components/layouts/Page";
import MagazineIssue02Page from "@/features/app/components/magazine/MagazineIssue02Page";
import {
  issue02Meta,
  issue02OrderedSlugs,
} from "@/features/app/content/magazine/issue02AfterMidnight";
import { getMagazineBooksBySlugs } from "@/features/app/magazine/services";
import { isFeatureEnabledForUser } from "@/lib/features";
import InfoPage from "@/pages/InfoPage";
import { canonicalUrl, pageTitle, truncateDescription } from "@/lib/seo";
import { heroLcpImageSources } from "@/lib/imageUrl";
import { getUser } from "@/utils";

const path = `/magazine/${issue02Meta.slug}`;

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  if (!isFeatureEnabledForUser("magazine", user)) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }
  const currentPath = c.req.path;

  const [booksError, books] = await getMagazineBooksBySlugs(issue02OrderedSlugs);
  if (booksError) {
    return c.html(<InfoPage errorMessage={booksError.reason} user={user} />);
  }

  const title = pageTitle(`${issue02Meta.kicker}: ${issue02Meta.title}`);
  const description = truncateDescription(issue02Meta.subtitle);
  const issueCanonicalUrl = canonicalUrl(c.req.url, path);
  const shareImage = issue02Meta.bannerUrl;

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
        <MagazineIssue02Page books={books} />
      </Page>
    </AppLayout>,
  );
});
