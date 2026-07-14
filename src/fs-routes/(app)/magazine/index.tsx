import { createRoute } from "hono-fsr";
import AppLayout from "@/components/layouts/AppLayout";
import Page from "@/components/layouts/Page";
import PageHeader from "@/components/app/PageHeader";
import Link from "@/components/app/Link";
import { listPublishedIssues } from "@/domain/magazine/queries";
import { isFeatureEnabledForUser } from "@/lib/features";
import InfoPage from "@/pages/InfoPage";
import { canonicalUrl, pageTitle, truncateDescription } from "@/lib/seo";
import { getUser } from "@/utils";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  if (!isFeatureEnabledForUser("magazine", user)) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }

  const [error, issues] = await listPublishedIssues();
  if (error) {
    return c.html(<InfoPage errorMessage={error.reason} user={user} />);
  }

  const currentPath = c.req.path;
  const title = pageTitle("Magazine");
  const description = truncateDescription(
    "A monthly digital magazine from photobookers — themed issues with essays and curated photobooks.",
  );

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, "/magazine")}
      currentPath={currentPath}
      user={user}
    >
      <Page>
        <div class="mx-auto flex w-full max-w-2xl flex-col gap-8">
          <PageHeader
            kicker="Photobookers"
            title="Magazine"
            intro="A monthly digital magazine. Each issue follows a theme, with an essay and eight to ten photobooks — and contributions from the artists whose work was selected."
          />
          {issues.length === 0 ? (
            <p class="border-t border-outline pt-8 text-on-surface">
              No issues published yet.
            </p>
          ) : (
            <ul class="flex flex-col gap-4 border-t border-outline pt-8">
              {issues.map((issue) => {
                const kicker =
                  issue.kicker ??
                  (issue.issueNumber ? `Issue ${issue.issueNumber}` : "Issue");
                return (
                  <li class="flex flex-col gap-4 border-b border-outline pb-6 sm:flex-row sm:items-start sm:gap-6">
                    {issue.coverUrl ? (
                      <Link
                        href={`/magazine/${issue.slug}`}
                        className="shrink-0 no-underline"
                      >
                        <img
                          src={issue.coverUrl}
                          alt={`${kicker}: ${issue.title}`}
                          width={400}
                          height={600}
                          class="w-32 border border-outline object-cover sm:w-36"
                        />
                      </Link>
                    ) : null}
                    <div class="flex flex-col gap-2">
                      <p class="kicker text-accent">{kicker}</p>
                      <h2 class="font-display text-3xl font-medium text-on-surface-strong">
                        <Link
                          href={`/magazine/${issue.slug}`}
                          className="hover:text-accent no-underline"
                        >
                          {issue.title}
                        </Link>
                      </h2>
                      {issue.subtitle ? (
                        <p class="text-base leading-relaxed text-on-surface">
                          {issue.subtitle}
                        </p>
                      ) : null}
                      {issue.publishedLabel ? (
                        <p class="text-sm text-on-surface">
                          {issue.publishedLabel}
                        </p>
                      ) : null}
                      <Link
                        href={`/magazine/${issue.slug}`}
                        className="text-sm font-medium text-on-surface-strong underline decoration-accent underline-offset-4 hover:text-accent"
                      >
                        Read issue →
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Page>
    </AppLayout>,
  );
});
