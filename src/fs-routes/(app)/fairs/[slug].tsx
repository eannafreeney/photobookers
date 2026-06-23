import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { paramValidator } from "../../../lib/validator";
import { z } from "zod";
import AppLayout from "../../../components/layouts/AppLayout";
import { getUser } from "../../../utils";
import { isFeatureEnabledForUser } from "../../../lib/features";
import InfoPage from "../../../pages/InfoPage";
import { getFairBySlug } from "../../../features/app/fairs/services";
import FairDetail from "../../../features/app/fairs/components/FairDetail";
import {
  pageTitle,
  canonicalUrl,
  truncateDescription,
  buildFairJsonLd,
} from "../../../lib/seo";
import { recordFairView } from "../../../features/fair-views/services";
import { isCreatorAttendingFair } from "../../../features/fair-attendees/services";
import { getIsMobile } from "../../../lib/device";

const slugSchema = z.object({
  slug: z.string(),
});

export const GET = createRoute(
  paramValidator(slugSchema),
  async (c: Context) => {
    const user = await getUser(c);
    const currentPath = c.req.path;
    const slug = c.req.param("slug");
    const isMobile = getIsMobile(c.req.header("user-agent") ?? "");

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
      return c.html(
        <InfoPage errorMessage="Fair not found" user={user} />,
        404,
      );
    }

    // Track page view
    if (isPublished) {
      const referer = c.req.header("referer") || null;
      await recordFairView({
        fairId: fair.id,
        userId: user?.id,
        source: "web",
        referer,
      });
    }

    let isAttending = false;
    if (user?.creator) {
      const [attendingError, attending] = await isCreatorAttendingFair(
        fair.id,
        user.creator.id,
      );
      if (!attendingError) {
        isAttending = attending;
      }
    }

    const fairCanonicalUrl = canonicalUrl(c.req.url, `/fairs/${fair.slug}`);
    const title = pageTitle(fair.name);
    const description = truncateDescription(
      fair.description ??
        `${fair.name} - Photobook fair in ${fair.city ?? fair.country ?? ""}`,
    );

    const fairJsonLd = buildFairJsonLd({
      ...fair,
      canonicalUrl: fairCanonicalUrl,
    });

    return c.html(
      <AppLayout
        title={title}
        description={description}
        canonicalUrl={fairCanonicalUrl}
        shareOg={{
          title: fair.name,
          description: description,
          image: fair.bannerUrl ?? fair.coverUrl ?? undefined,
          url: fairCanonicalUrl,
        }}
        jsonLd={fairJsonLd}
        user={user}
        currentPath={currentPath}
      >
        <FairDetail
          fair={fair}
          user={user}
          isAttending={isAttending}
          isMobile={isMobile}
        />
      </AppLayout>,
    );
  },
);
