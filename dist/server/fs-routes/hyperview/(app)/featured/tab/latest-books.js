import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import {
  FeaturedLatestBooksCatalogShell,
  FeaturedLatestBooksSection,
  FEATURED_LATEST_BOOKS_DEFAULT_SORT,
  loadFeaturedLatestBooksCatalog
} from "../../../../../features/hyperview/components/BookGridWithFilters.js";
import { BOOKS_CATALOG_TARGET_ID } from "../../../../../features/hyperview/components/BookFiltersPanel.js";
import { hyperview } from "../../../../../lib/hxml.js";
import { Text, View } from "../../../../../lib/hxml-comps.js";
import { getBaseUrl } from "../../../../../lib/hyperview.js";
import { resolveBookCatalogSort } from "../../../../../lib/tags.js";
import { getUser } from "../../../../../utils.js";
const renderCatalog = (tag, q, sort, catalogProps) => /* @__PURE__ */ jsx(
  FeaturedLatestBooksCatalogShell,
  {
    ...catalogProps,
    tag,
    q,
    sort,
    defaultSort: FEATURED_LATEST_BOOKS_DEFAULT_SORT
  }
);
const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const isCatalogFragment = c.req.query("fragment") === "catalog";
  if (!isCatalogFragment) {
    return hv(
      /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsx(FeaturedLatestBooksSection, { baseUrl, user }) })
    );
  }
  const tag = c.req.query("tag") ?? null;
  const q = c.req.query("q") ?? null;
  const sort = resolveBookCatalogSort(
    c.req.query("sort"),
    FEATURED_LATEST_BOOKS_DEFAULT_SORT
  );
  const catalogProps = await loadFeaturedLatestBooksCatalog(
    user,
    baseUrl,
    tag,
    q,
    c.req.query("sort")
  );
  if (!catalogProps) {
    return hv(/* @__PURE__ */ jsx(Fragment, {}));
  }
  return hv(renderCatalog(tag, q, sort, catalogProps));
});
const POST = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const formData = await c.req.formData();
  const q = String(formData.get("q") ?? "").trim();
  const tagFromRequest = (c.req.query("tag") ?? String(formData.get("tag") ?? "").trim()) || null;
  const tag = q.length >= 3 ? tagFromRequest : null;
  const sort = resolveBookCatalogSort(
    c.req.query("sort"),
    FEATURED_LATEST_BOOKS_DEFAULT_SORT
  );
  const catalogProps = await loadFeaturedLatestBooksCatalog(
    user,
    baseUrl,
    tag,
    q,
    c.req.query("sort")
  );
  if (!catalogProps) {
    return hv(
      /* @__PURE__ */ jsx(
        View,
        {
          id: BOOKS_CATALOG_TARGET_ID,
          style: "books-catalog-shell",
          xmlns: "https://hyperview.org/hyperview",
          children: /* @__PURE__ */ jsx(Text, { style: "featured-empty-hint", children: "Could not filter books." })
        }
      )
    );
  }
  return hv(renderCatalog(tag, q, sort, catalogProps));
});
export {
  GET,
  POST
};
