import { createRoute } from "hono-fsr";
import {
  FeaturedLatestBooksCatalogShell,
  FeaturedLatestBooksSection,
  FEATURED_LATEST_BOOKS_DEFAULT_SORT,
  loadFeaturedLatestBooksCatalog,
} from "../../../../../features/hyperview/components/BookGridWithFilters";
import { BOOKS_CATALOG_TARGET_ID } from "../../../../../features/hyperview/components/BookFiltersPanel";
import { hyperview } from "../../../../../lib/hxml";
import { Text, View } from "../../../../../lib/hxml-comps";
import { getBaseUrl } from "../../../../../lib/hyperview";
import { resolveBookCatalogSort } from "../../../../../lib/tags";
import { getUser } from "../../../../../utils";

const renderCatalog = (
  tag: string | null,
  q: string | null,
  sort: ReturnType<typeof resolveBookCatalogSort>,
  catalogProps: NonNullable<
    Awaited<ReturnType<typeof loadFeaturedLatestBooksCatalog>>
  >,
) => (
  <FeaturedLatestBooksCatalogShell
    {...catalogProps}
    tag={tag}
    q={q}
    sort={sort}
    defaultSort={FEATURED_LATEST_BOOKS_DEFAULT_SORT}
  />
);

export const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const isCatalogFragment = c.req.query("fragment") === "catalog";

  if (!isCatalogFragment) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview">
        <FeaturedLatestBooksSection baseUrl={baseUrl} user={user} />
      </view>,
    );
  }

  const tag = c.req.query("tag") ?? null;
  const q = c.req.query("q") ?? null;
  const sort = resolveBookCatalogSort(
    c.req.query("sort"),
    FEATURED_LATEST_BOOKS_DEFAULT_SORT,
  );

  const catalogProps = await loadFeaturedLatestBooksCatalog(
    user,
    baseUrl,
    tag,
    q,
    c.req.query("sort"),
  );
  if (!catalogProps) {
    return hv(<></>);
  }

  return hv(renderCatalog(tag, q, sort, catalogProps));
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
  const sort = resolveBookCatalogSort(
    c.req.query("sort"),
    FEATURED_LATEST_BOOKS_DEFAULT_SORT,
  );

  const catalogProps = await loadFeaturedLatestBooksCatalog(
    user,
    baseUrl,
    tag,
    q,
    c.req.query("sort"),
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

  return hv(renderCatalog(tag, q, sort, catalogProps));
});
