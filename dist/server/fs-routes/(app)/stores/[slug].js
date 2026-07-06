import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../lib/validator.js";
import AppLayout from "../../../components/layouts/AppLayout.js";
import { getUser } from "../../../utils.js";
import { isFeatureEnabledForUser } from "../../../lib/features.js";
import InfoPage from "../../../pages/InfoPage.js";
import { getStoreBySlug } from "../../../features/app/stores/services.js";
import StoreDetail from "../../../features/app/stores/components/StoreDetail.js";
import {
  pageTitle,
  canonicalUrl,
  truncateDescription,
  buildStoreJsonLd
} from "../../../lib/seo.js";
import { resolveStoreCoverUrl } from "../../../features/app/stores/coverUrl.js";
import { slugSchema } from "../../../features/app/schema.js";
import { routeParam } from "../../../lib/routeParam.js";
const GET = createRoute(
  paramValidator(slugSchema),
  async (c) => {
    const user = await getUser(c);
    const currentPath = c.req.path;
    const slug = routeParam(c, "slug");
    if (!isFeatureEnabledForUser("stores", user)) {
      return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Not found", user }), 404);
    }
    const [error, store] = await getStoreBySlug(slug);
    if (error) {
      return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: error.reason, user }), 404);
    }
    const isPublished = store.status === "published" && store.approvalStatus === "approved";
    if (!isPublished && !user?.isAdmin) {
      return c.html(
        /* @__PURE__ */ jsx(InfoPage, { errorMessage: "Store not found", user }),
        404
      );
    }
    const storeCanonicalUrl = canonicalUrl(c.req.url, `/stores/${store.slug}`);
    const title = pageTitle(store.name);
    const description = truncateDescription(
      store.description ?? `${store.name} - Photobook shop in ${store.city}, ${store.country}`
    );
    const coverUrl = resolveStoreCoverUrl(store);
    const storeJsonLd = buildStoreJsonLd({
      ...store,
      canonicalUrl: storeCanonicalUrl,
      imageUrl: coverUrl
    });
    return c.html(
      /* @__PURE__ */ jsx(
        AppLayout,
        {
          title,
          description,
          canonicalUrl: storeCanonicalUrl,
          shareOg: {
            title: store.name,
            description,
            image: coverUrl,
            url: storeCanonicalUrl
          },
          jsonLd: storeJsonLd,
          user,
          currentPath,
          children: /* @__PURE__ */ jsx(StoreDetail, { store })
        }
      )
    );
  }
);
export {
  GET
};
