import { createRoute } from "hono-fsr";
import {
  BookGridCatalog,
  loadFeaturedLatestBooksCatalog,
} from "../../../../../features/hyperview/components/BookGridWithFilters";
import { BOOKS_CATALOG_TARGET_ID } from "../../../../../features/hyperview/components/BookFiltersPanel";
import { hyperview } from "../../../../../lib/hxml";
import { Text, View } from "../../../../../lib/hxml-comps";
import { getBaseUrl } from "../../../../../lib/hyperview";
import { getUser } from "../../../../../utils";

const renderCatalog = (
  catalogProps: NonNullable<
    Awaited<ReturnType<typeof loadFeaturedLatestBooksCatalog>>
  >,
) => (
  <View
    id={BOOKS_CATALOG_TARGET_ID}
    style="latest-books-catalog"
    xmlns="https://hyperview.org/hyperview"
  >
    <BookGridCatalog {...catalogProps} />
  </View>
);

export const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const tag = c.req.query("tag") ?? null;
  const q = c.req.query("q") ?? null;

  const catalogProps = await loadFeaturedLatestBooksCatalog(
    user,
    baseUrl,
    tag,
    q,
  );
  if (!catalogProps) {
    return hv(<></>);
  }

  return hv(renderCatalog(catalogProps));
});

export const POST = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const formData = await c.req.formData();
  const q = String(formData.get("q") ?? "").trim();
  const tagFromRequest =
    (c.req.query("tag") ?? String(formData.get("tag") ?? "").trim()) || null;
  const tag = q.length >= 3 ? tagFromRequest : null;

  const catalogProps = await loadFeaturedLatestBooksCatalog(
    user,
    baseUrl,
    tag,
    q,
  );

  if (!catalogProps) {
    return hv(
      <View
        id={BOOKS_CATALOG_TARGET_ID}
        style="latest-books-catalog"
        xmlns="https://hyperview.org/hyperview"
      >
        <Text style="featured-empty-hint">Could not filter books.</Text>
      </View>,
    );
  }

  return hv(renderCatalog(catalogProps));
});
