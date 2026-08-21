import { createRoute } from "hono-fsr";
import PageHeader from "../../components/app/PageHeader";
import Page from "../../components/layouts/Page";
import AppLayout from "../../components/layouts/AppLayout";
import AudienceLandingContent from "../../features/app/components/AudienceLandingContent";
import { audiencePages } from "../../features/app/content/audiencePagesContent";
import { canonicalUrl, pageTitle } from "../../lib/seo";

const page = audiencePages.collectors;

export const GET = createRoute(async (c) => {
  return c.html(
    <AppLayout
      title={pageTitle(page.metaTitle)}
      description={page.metaDescription}
      canonicalUrl={canonicalUrl(c.req.url, page.path)}
      currentPath={c.req.path}
    >
      <Page>
        <PageHeader
          kicker={page.kicker}
          title={page.title}
          intro={page.intro}
        />
        <AudienceLandingContent page={page} />
      </Page>
    </AppLayout>,
  );
});
