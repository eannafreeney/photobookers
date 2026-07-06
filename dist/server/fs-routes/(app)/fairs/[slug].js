import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../lib/validator.js";
import { z } from "zod";
import AppLayout from "../../../components/layouts/AppLayout.js";
import { getUser } from "../../../utils.js";
import { isFeatureEnabledForUser } from "../../../lib/features.js";
import InfoPage from "../../../pages/InfoPage.js";
import { getFairBySlug } from "../../../features/app/fairs/services.js";
import FairDetail from "../../../features/app/fairs/components/FairDetail.js";
import {
  pageTitle,
  canonicalUrl,
  truncateDescription,
  buildFairJsonLd
} from "../../../lib/seo.js";
import { recordFairView } from "../../../features/fair-views/services.js";
import { isCreatorAttendingFair } from "../../../features/fair-attendees/services.js";
import { getIsMobile } from "../../../lib/device.js";
import { routeParam } from "../../../lib/routeParam.js";
const slugSchema = z.object({
  slug: z.string()
});
const GET = createRoute(
  paramValidator(slugSchema),
  async (c) => {
    const user = await getUser(c);
    const currentPath = c.req.path;
    const slug = routeParam(c, "slug");
    const isMobile = getIsMobile(c.req.header("user-agent") ?? "");
    if (!isFeatureEnabledForUser("fairs", user)) {
      return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Not found", user }), 404);
    }
    const [error, fair] = await getFairBySlug(slug);
    if (error) {
      return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: error.reason, user }), 404);
    }
    const isPublished = fair.status === "published" && fair.approvalStatus === "approved";
    if (!isPublished && !user?.isAdmin) {
      return c.html(
        /* @__PURE__ */ jsx(InfoPage, { errorMessage: "Fair not found", user }),
        404
      );
    }
    if (isPublished) {
      const referer = c.req.header("referer") || null;
      await recordFairView({
        fairId: fair.id,
        userId: user?.id,
        source: "web",
        referer
      });
    }
    let isAttending = false;
    if (user?.creator) {
      const [attendingError, attending] = await isCreatorAttendingFair(
        fair.id,
        user.creator.id
      );
      if (!attendingError) {
        isAttending = attending;
      }
    }
    const fairCanonicalUrl = canonicalUrl(c.req.url, `/fairs/${fair.slug}`);
    const title = pageTitle(fair.name);
    const description = truncateDescription(
      fair.description ?? `${fair.name} - Photobook fair in ${fair.city ?? fair.country ?? ""}`
    );
    const fairJsonLd = buildFairJsonLd({
      ...fair,
      canonicalUrl: fairCanonicalUrl
    });
    return c.html(
      /* @__PURE__ */ jsx(
        AppLayout,
        {
          title,
          description,
          canonicalUrl: fairCanonicalUrl,
          shareOg: {
            title: fair.name,
            description,
            image: fair.bannerUrl ?? fair.coverUrl ?? void 0,
            url: fairCanonicalUrl
          },
          jsonLd: fairJsonLd,
          user,
          currentPath,
          children: /* @__PURE__ */ jsx(
            FairDetail,
            {
              fair,
              user,
              isAttending,
              isMobile
            }
          )
        }
      )
    );
  }
);
export {
  GET
};
