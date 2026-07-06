import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { z } from "zod";
import { paramValidator } from "../../../../lib/validator.js";
import { AppLayout } from "../../+layout.js";
import { hyperview } from "../../../../lib/hxml.js";
import { View } from "../../../../lib/hxml-comps.js";
import { getBaseUrl } from "../../../../lib/hyperview.js";
import { getUser } from "../../../../utils.js";
import { isFeatureEnabledForUser } from "../../../../lib/features.js";
import { getFairBySlug } from "../../../../features/app/fairs/services.js";
import { isCreatorAttendingFair } from "../../../../features/fair-attendees/services.js";
import { recordFairView } from "../../../../features/fair-views/services.js";
import FairDetailBody, {
  fairDetailBodyStyles
} from "../../../../features/hyperview/components/FairDetailBody.js";
import { signInEmptyHintStyles } from "../../../../features/hyperview/hyperviewCommonScreenStyles.js";
import ErrorScreen from "../../../../features/hyperview/components/ErrorScreen.js";
const slugSchema = z.object({
  slug: z.string()
});
const GET = createRoute(paramValidator(slugSchema), async (c) => {
  const slug = c.req.valid("param").slug;
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const hv = hyperview(c);
  if (!isFeatureEnabledForUser("fairs", user)) {
    return hv(
      /* @__PURE__ */ jsx(ErrorScreen, { user, baseUrl, message: "Not found" }),
      404
    );
  }
  const [error, fair] = await getFairBySlug(slug);
  if (error) {
    return hv(
      /* @__PURE__ */ jsx(ErrorScreen, { user, baseUrl, message: error.reason }),
      404
    );
  }
  const isPublished = fair.status === "published" && fair.approvalStatus === "approved";
  if (!isPublished && !user?.isAdmin) {
    return hv(
      /* @__PURE__ */ jsx(ErrorScreen, { user, baseUrl, message: "Fair not found" }),
      404
    );
  }
  if (isPublished) {
    await recordFairView({
      fairId: fair.id,
      userId: user?.id,
      source: "hyperview"
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
  return hv(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: fair.name,
        user,
        baseUrl,
        fixedHeader: true,
        extraStyles: pageStyles(),
        children: /* @__PURE__ */ jsx(View, { style: "page-content", children: /* @__PURE__ */ jsx(
          FairDetailBody,
          {
            fair,
            user,
            baseUrl,
            isAttending
          }
        ) })
      }
    )
  );
});
const pageStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  signInEmptyHintStyles(),
  fairDetailBodyStyles()
] });
export {
  GET
};
