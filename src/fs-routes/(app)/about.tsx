import { createRoute } from "hono-fsr";
import PageHeader from "../../components/app/PageHeader";
import Page from "../../components/layouts/Page";
import AppLayout from "../../components/layouts/AppLayout";
import AboutPageContent from "../../features/app/components/AboutPageContent";
import { aboutPageMeta } from "../../features/app/content/aboutPageContent";
import { canonicalUrl, pageTitle } from "../../lib/seo";

export const GET = createRoute(async (c) => {
  const currentPath = c.req.path;
  const title = pageTitle("About");
  const description =
    "Photobookers is a place to discover photobooks, follow artists and publishers, and explore book fairs — for collectors, artists, and publishers.";

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, "/about")}
      currentPath={currentPath}
    >
      <Page>
        <PageHeader
          kicker="About"
          title={aboutPageMeta.title}
          intro={aboutPageMeta.intro}
        />
        <AboutPageContent />
      </Page>
    </AppLayout>,
  );
});
