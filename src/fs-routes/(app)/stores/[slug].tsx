import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { paramValidator } from "../../../lib/validator";
import { z } from "zod";
import AppLayout from "../../../components/layouts/AppLayout";
import { getUser } from "../../../utils";
import { isFeatureEnabledForUser } from "../../../lib/features";
import InfoPage from "../../../pages/InfoPage";
import { getStoreBySlug } from "../../../features/app/stores/services";
import StoreDetail from "../../../features/app/stores/components/StoreDetail";
import {
  pageTitle,
  canonicalUrl,
  truncateDescription,
  buildStoreJsonLd,
} from "../../../lib/seo";
import { resolveStoreCoverUrl } from "../../../features/app/stores/coverUrl";
import { slugSchema } from "../../../features/app/schema";
import { routeParam } from "../../../lib/routeParam";

export const GET = createRoute(
  paramValidator(slugSchema),
  async (c: Context) => {
    const user = await getUser(c);
    const currentPath = c.req.path;
    const slug = routeParam(c, "slug");

    if (!isFeatureEnabledForUser("stores", user)) {
      return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
    }

    const [error, store] = await getStoreBySlug(slug);
    if (error) {
      return c.html(<InfoPage errorMessage={error.reason} user={user} />, 404);
    }

    const isPublished =
      store.status === "published" && store.approvalStatus === "approved";

    if (!isPublished && !user?.isAdmin) {
      return c.html(
        <InfoPage errorMessage="Store not found" user={user} />,
        404,
      );
    }

    const storeCanonicalUrl = canonicalUrl(c.req.url, `/stores/${store.slug}`);
    const title = pageTitle(store.name);
    const description = truncateDescription(
      store.description ??
        `${store.name} - Photobook shop in ${store.city}, ${store.country}`,
    );
    const coverUrl = resolveStoreCoverUrl(store);

    const storeJsonLd = buildStoreJsonLd({
      ...store,
      canonicalUrl: storeCanonicalUrl,
      imageUrl: coverUrl,
    });

    return c.html(
      <AppLayout
        title={title}
        description={description}
        canonicalUrl={storeCanonicalUrl}
        shareOg={{
          title: store.name,
          description,
          image: coverUrl,
          url: storeCanonicalUrl,
        }}
        jsonLd={storeJsonLd}
        user={user}
        currentPath={currentPath}
      >
        <StoreDetail store={store} />
      </AppLayout>,
    );
  },
);
