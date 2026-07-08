import { createRoute } from "hono-fsr";
import PageHeader from "../../components/app/PageHeader";
import Page from "../../components/layouts/Page";
import AppLayout from "../../components/layouts/AppLayout";
import NewsletterForm from "../../features/app/components/NewsletterForm";
import { canonicalUrl, pageTitle } from "../../lib/seo";
import { NEWSLETTER_COPY } from "../../constants/newsletter";
import HeadlessLayout from "@/components/layouts/HeadlessLayout";

export { POST } from "../api/newsletter";

export const GET = createRoute(async (c) => {
  const title = pageTitle("Newsletter");
  const description =
    "Get a daily Book of the Day pick and weekly photobook highlights from Photobookers.";

  return c.html(
    <HeadlessLayout title={title} description={description}>
      <Page>
        <PageHeader
          kicker={NEWSLETTER_COPY.kicker}
          title={NEWSLETTER_COPY.title}
          intro={NEWSLETTER_COPY.pageIntro}
        />
        <div class="mx-auto w-full max-w-md flex flex-col gap-8">
          <ul class="list-disc list-inside space-y-2 text-sm text-on-surface">
            {NEWSLETTER_COPY.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          <NewsletterForm />
        </div>
      </Page>
    </HeadlessLayout>,
  );
});
