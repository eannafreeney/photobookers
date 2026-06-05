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
        <div class="container mx-auto max-w-4xl flex flex-col gap-4">
          {PRIVACY_SECTIONS.map((section) => (
            <div>{section}</div>
          ))}
        </div>
      </Page>
    </AppLayout>,
  );
});
