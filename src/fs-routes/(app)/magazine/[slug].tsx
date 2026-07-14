import { createRoute } from "hono-fsr";
import AppLayout from "@/components/layouts/AppLayout";
import Page from "@/components/layouts/Page";
import MagazineIssuePage from "@/features/app/components/magazine/MagazineIssuePage";
import { getPublishedIssueBySlug } from "@/domain/magazine/queries";
import { isFeatureEnabledForUser } from "@/lib/features";
import InfoPage from "@/pages/InfoPage";
import { canonicalUrl, pageTitle, truncateDescription } from "@/lib/seo";
import { heroLcpImageSources } from "@/lib/imageUrl";
import { getUser } from "@/utils";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  if (!isFeatureEnabledForUser("magazine", user)) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }

  const slug = c.req.param("slug");
  if (!slug) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }
  const [error, issue] = await getPublishedIssueBySlug(slug);
  if (error) {
    return c.html(<InfoPage errorMessage={error.reason} user={user} />);
  }
  if (!issue) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }

  const kicker =
    issue.kicker ??
    (issue.issueNumber ? `Issue ${issue.issueNumber}` : "Magazine");
  const title = pageTitle(`${kicker}: ${issue.title}`);
  const description = truncateDescription(issue.subtitle ?? issue.title);
  const path = `/magazine/${issue.slug}`;
  const issueCanonicalUrl = canonicalUrl(c.req.url, path);
  const shareImage = issue.bannerUrl ?? issue.coverUrl ?? "";

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
      currentPath={c.req.path}
      user={user}
      shareOg={{
        title,
        description,
        image: shareImage,
        url: issueCanonicalUrl,
      }}
      preloadLcpImage={shareImage ? heroLcpImageSources(shareImage) : undefined}
    >
      <Page>
        <MagazineIssuePage issue={issue} />
      </Page>
    </AppLayout>,
  );
});
