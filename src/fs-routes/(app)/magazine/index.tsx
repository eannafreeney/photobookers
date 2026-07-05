import { createRoute } from "hono-fsr";
import AppLayout from "@/components/layouts/AppLayout";
import Page from "@/components/layouts/Page";
import PageHeader from "@/components/app/PageHeader";
import Link from "@/components/app/Link";
import { issue01Meta } from "@/features/app/content/magazine/issue01OnTheSidewalk";
import { canonicalUrl, pageTitle, truncateDescription } from "@/lib/seo";
import { getUser } from "@/utils";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
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
          <ul class="flex flex-col gap-4 border-t border-outline pt-8">
            <li class="flex flex-col gap-2 border-b border-outline pb-6">
              <p class="kicker text-accent">{issue01Meta.kicker}</p>
              <h2 class="font-display text-3xl font-medium text-on-surface-strong">
                <Link
                  href={`/magazine/${issue01Meta.slug}`}
                  className="hover:text-accent no-underline"
                >
                  {issue01Meta.title}
                </Link>
              </h2>
              <p class="text-base leading-relaxed text-on-surface">
                {issue01Meta.subtitle}
              </p>
              <p class="text-sm text-on-surface">{issue01Meta.publishedLabel}</p>
              <Link
                href={`/magazine/${issue01Meta.slug}`}
                className="text-sm font-medium text-on-surface-strong underline decoration-accent underline-offset-4 hover:text-accent"
              >
                Read issue →
              </Link>
            </li>
          </ul>
        </div>
      </Page>
    </AppLayout>,
  );
});
