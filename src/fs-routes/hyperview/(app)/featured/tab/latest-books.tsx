import { createRoute } from "hono-fsr";
import {
  FeaturedLatestBooksCatalogShell,
  loadFeaturedLatestBooksCatalog,
} from "../../../../../features/hyperview/components/BookGridWithFilters";
import { BOOKS_CATALOG_TARGET_ID } from "../../../../../features/hyperview/components/BookFiltersPanel";
import { hyperview } from "../../../../../lib/hxml";
import { Text, View } from "../../../../../lib/hxml-comps";
import { getBaseUrl } from "../../../../../lib/hyperview";
import { getUser } from "../../../../../utils";

const renderCatalog = (
  tag: string | null,
  q: string | null,
  catalogProps: NonNullable<
    Awaited<ReturnType<typeof loadFeaturedLatestBooksCatalog>>
  >,
) => (
  <FeaturedLatestBooksCatalogShell
    {...catalogProps}
    tag={tag}
    q={q}
  />
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

  return hv(renderCatalog(tag, q, catalogProps));
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
        style="books-catalog-shell"
        xmlns="https://hyperview.org/hyperview"
      >
        <Text style="featured-empty-hint">Could not filter books.</Text>
      </View>,
    );
  }

  return hv(renderCatalog(tag, q, catalogProps));
});
