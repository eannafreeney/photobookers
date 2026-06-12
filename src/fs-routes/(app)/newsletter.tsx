import { createRoute } from "hono-fsr";
import PageHeader from "../../components/app/PageHeader";
import Page from "../../components/layouts/Page";
import AppLayout from "../../components/layouts/AppLayout";
import NewsletterForm from "../../features/app/components/NewsletterForm";
import { canonicalUrl, pageTitle } from "../../lib/seo";

export { POST } from "../api/newsletter";

export const GET = createRoute(async (c) => {
  const currentPath = c.req.path;
  const title = pageTitle("Newsletter");
  const description =
    "Sign up for the Photobookers newsletter and discover new books and creators in your inbox.";

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, "/newsletter")}
      currentPath={currentPath}
    >
      <Page>
        <PageHeader
          kicker="Newsletter"
          title="Join the mailing list"
          intro="Discover new books and creators in your inbox — including our weekly Book of the Day picks."
        />
        <div class="mx-auto w-full max-w-md">
          <NewsletterForm />
        </div>
      </Page>
    </AppLayout>,
  );
});
