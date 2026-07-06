import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { z } from "zod";
import { paramValidator } from "../../../../lib/validator.js";
import { AppLayout } from "../../+layout.js";
import { hyperview } from "../../../../lib/hxml.js";
import { Style, View } from "../../../../lib/hxml-comps.js";
import { getBaseUrl } from "../../../../lib/hyperview.js";
import { getUser } from "../../../../utils.js";
import { isFeatureEnabledForUser } from "../../../../lib/features.js";
import { getStoreBySlug } from "../../../../features/app/stores/services.js";
import StoreDetailBody, {
  storeDetailBodyStyles
} from "../../../../features/hyperview/components/StoreDetailBody.js";
import ErrorScreen from "../../../../features/hyperview/components/ErrorScreen.js";
const slugSchema = z.object({
  slug: z.string()
});
const GET = createRoute(paramValidator(slugSchema), async (c) => {
  const slug = c.req.valid("param").slug;
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const hv = hyperview(c);
  if (!isFeatureEnabledForUser("stores", user)) {
    return hv(
      /* @__PURE__ */ jsx(ErrorScreen, { user, baseUrl, message: "Not found" }),
      404
    );
  }
  const [error, store] = await getStoreBySlug(slug);
  if (error) {
    return hv(
      /* @__PURE__ */ jsx(ErrorScreen, { user, baseUrl, message: error.reason }),
      404
    );
  }
  const isPublished = store.status === "published" && store.approvalStatus === "approved";
  if (!isPublished && !user?.isAdmin) {
    return hv(
      /* @__PURE__ */ jsx(ErrorScreen, { user, baseUrl, message: "Store not found" }),
      404
    );
  }
  return hv(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: store.name,
        user,
        baseUrl,
        fixedHeader: true,
        extraStyles: pageStyles(),
        children: /* @__PURE__ */ jsx(View, { style: "page-content", children: /* @__PURE__ */ jsx(StoreDetailBody, { store }) })
      }
    )
  );
});
const pageStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(Style, { id: "tab-fragment", flex: 1 }),
  storeDetailBodyStyles()
] });
export {
  GET
};
