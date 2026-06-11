import { createRoute } from "hono-fsr";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import { PRIVACY_SECTIONS } from "../../features/legal/privacyContent";
import { canonicalUrl, pageTitle } from "../../lib/seo";

export const GET = createRoute(async (c) => {
  const currentPath = c.req.path;

  const title = pageTitle("Privacy Policy");
  const description = "Privacy policy for photobookers.";

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, "/privacy")}
      currentPath={currentPath}
    >
      <Page>
        <div class="container mx-auto max-w-2xl flex flex-col gap-4">
          <header class="flex flex-col gap-2 border-b-2 border-on-surface-strong pb-6 mb-4">
            <span class="kicker text-accent">The Small Print</span>
            <h1 class="font-display text-4xl md:text-5xl font-medium leading-tight text-on-surface-strong">
              Privacy Policy
            </h1>
          </header>
          {PRIVACY_SECTIONS.map((section) => (
            <div>{section}</div>
          ))}
        </div>
      </Page>
    </AppLayout>,
  );
});
