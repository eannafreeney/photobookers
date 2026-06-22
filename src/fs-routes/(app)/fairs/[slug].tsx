import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { paramValidator } from "../../../lib/validator";
import { z } from "zod";
import AppLayout from "../../../components/layouts/AppLayout";
import { getUser } from "../../../utils";
import Page from "../../../components/layouts/Page";
import { isFeatureEnabledForUser } from "../../../lib/features";
import InfoPage from "../../../pages/InfoPage";
import { getFairBySlug } from "../../../features/app/fairs/services";
import FairDetail from "../../../features/app/fairs/components/FairDetail";
import { pageTitle, canonicalUrl, truncateDescription, buildFairJsonLd } from "../../../lib/seo";

const slugSchema = z.object({
  slug: z.string(),
});

export const GET = createRoute(
  paramValidator(slugSchema),
  async (c: Context) => {
    const user = await getUser(c);
    const currentPath = c.req.path;
    const slug = c.req.param("slug");

    if (!isFeatureEnabledForUser("fairs", user)) {
      return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
    }

    const [error, fair] = await getFairBySlug(slug);
    if (error) {
      return c.html(<InfoPage errorMessage={error.reason} user={user} />, 404);
    }

    const isPublished =
      fair.status === "published" && fair.approvalStatus === "approved";
    
    if (!isPublished && !user?.isAdmin) {
      return c.html(<InfoPage errorMessage="Fair not found" user={user} />, 404);
    }

    const fairCanonicalUrl = canonicalUrl(c.req.url, `/fairs/${fair.slug}`);
    const title = pageTitle(fair.name);
    const description = truncateDescription(
      fair.description ?? `${fair.name} - Photobook fair in ${fair.city ?? fair.country ?? ""}`,
    );

    const fairJsonLd = buildFairJsonLd({
      name: fair.name,
      description: fair.description,
      slug: fair.slug,
      coverUrl: fair.coverUrl,
      bannerUrl: fair.bannerUrl,
      canonicalUrl: fairCanonicalUrl,
      startDate: fair.startDate,
      endDate: fair.endDate,
      city: fair.city,
      country: fair.country,
      venue: fair.venue,
      website: fair.website,
    });

    return c.html(
      <AppLayout
        title={title}
        description={description}
        canonicalUrl={fairCanonicalUrl}
        shareOg={{
          title: fair.name,
          description: description,
          image: fair.coverUrl ?? undefined,
          url: fairCanonicalUrl,
        }}
        jsonLd={fairJsonLd}
        user={user}
        currentPath={currentPath}
      >
        <Page>
          <FairDetail fair={fair} />
        </Page>
      </AppLayout>,
    );
  },
);
