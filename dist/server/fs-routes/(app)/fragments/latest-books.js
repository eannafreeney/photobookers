import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import SectionTitle from "../../../components/app/SectionTitle.js";
import { BOOKS_CATALOG_TARGET_ID } from "../../../features/app/components/BookFilters.js";
import BooksGridWithFilters from "../../../features/app/components/BookGridWithFilters.js";
import ViewAllLink from "../../../features/app/components/ViewAllLink.js";
import { getFilteredBooks } from "../../../features/app/services.js";
import { BOOK_CATALOG_DEFAULT_SORT } from "../../../lib/bookCatalogSort.js";
import { booksFilterUrl, resolveBookCatalogSort } from "../../../lib/tags.js";
import { getUser } from "../../../utils.js";
const FEATURED_BOOKS_LIMIT = 10;
const FRAGMENT_PATH = "/fragments/latest-books";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const tag = c.req.query("tag") ?? null;
  const query = c.req.query("q") ?? null;
  const sort = resolveBookCatalogSort(
    c.req.query("sort"),
    BOOK_CATALOG_DEFAULT_SORT
  );
  const isFiltered = Boolean(tag?.trim() || (query?.trim()?.length ?? 0) >= 3);
  const viewAllHref = booksFilterUrl("/books", {
    tag,
    query,
    sort,
    defaultSort: BOOK_CATALOG_DEFAULT_SORT
  });
  const [error, result] = await getFilteredBooks({
    tag,
    query,
    page: 1,
    limit: FEATURED_BOOKS_LIMIT,
    sort
  });
  if (error || !result) return c.html(/* @__PURE__ */ jsx(Fragment, {}));
  const hasMore = result.totalPages > 1;
  const gridProps = {
    user,
    tag,
    query,
    sort,
    defaultSort: BOOK_CATALOG_DEFAULT_SORT,
    currentPath: viewAllHref,
    result,
    isFiltered,
    isInfiniteScroll: false,
    ajaxPath: FRAGMENT_PATH,
    historyPath: null,
    hasMore,
    viewAllHref
  };
  if (c.req.query("fragment") === "grid") {
    return c.html(
      /* @__PURE__ */ jsx("div", { id: BOOKS_CATALOG_TARGET_ID, "x-merge": "replace", children: /* @__PURE__ */ jsx(BooksGridWithFilters, { ...gridProps }) })
    );
  }
  return c.html(
    /* @__PURE__ */ jsxs("div", { id: "latest-books-fragment", children: [
      /* @__PURE__ */ jsxs("div", { class: "flex items-end justify-between mb-3 border-t-2 border-on-surface-strong pt-3", children: [
        /* @__PURE__ */ jsx(SectionTitle, { className: "mb-0", kicker: "New Arrivals", children: "Latest Books" }),
        /* @__PURE__ */ jsx(ViewAllLink, { href: "/books" })
      ] }),
      /* @__PURE__ */ jsx("div", { id: BOOKS_CATALOG_TARGET_ID, children: /* @__PURE__ */ jsx(BooksGridWithFilters, { ...gridProps }) })
    ] })
  );
});
export {
  GET
};
