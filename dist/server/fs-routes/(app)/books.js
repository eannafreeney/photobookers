import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../utils.js";
import Page from "../../components/layouts/Page.js";
import { BOOKS_CATALOG_TARGET_ID } from "../../features/app/components/BookFilters.js";
import AppLayout from "../../components/layouts/AppLayout.js";
import { getFilteredBooks } from "../../features/app/services.js";
import PageHeader from "../../components/app/PageHeader.js";
import { canonicalUrl, pageTitle } from "../../lib/seo.js";
import { BOOK_CATALOG_DEFAULT_SORT } from "../../lib/bookCatalogSort.js";
import { booksFilterUrl, resolveBookCatalogSort } from "../../lib/tags.js";
import BooksGridWithFilters from "../../features/app/components/BookGridWithFilters.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const tag = c.req.query("tag") ?? null;
  const query = c.req.query("q") ?? null;
  const sort = resolveBookCatalogSort(
    c.req.query("sort"),
    BOOK_CATALOG_DEFAULT_SORT
  );
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = booksFilterUrl("/books", {
    tag,
    query,
    sort,
    defaultSort: BOOK_CATALOG_DEFAULT_SORT
  });
  const isFiltered = Boolean(tag?.trim() || (query?.trim()?.length ?? 0) >= 3);
  const [error, result] = await getFilteredBooks({
    tag,
    query,
    page: currentPage,
    limit: 30,
    sort
  });
  if (error || !result) return c.html(/* @__PURE__ */ jsx(Fragment, {}));
  if (c.req.query("fragment") === "grid") {
    return c.html(
      /* @__PURE__ */ jsx("div", { id: BOOKS_CATALOG_TARGET_ID, "x-merge": "replace", children: /* @__PURE__ */ jsx(
        BooksGridWithFilters,
        {
          user,
          tag,
          query,
          sort,
          defaultSort: BOOK_CATALOG_DEFAULT_SORT,
          currentPath,
          result,
          isFiltered
        }
      ) })
    );
  }
  const title = pageTitle("All Books");
  const description = "Browse the full photobookers catalogue. Discover photobooks from artists and publishers around the world.";
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title,
        description,
        canonicalUrl: canonicalUrl(c.req.url, currentPath),
        user,
        currentPath,
        children: /* @__PURE__ */ jsxs(Page, { children: [
          /* @__PURE__ */ jsx(
            PageHeader,
            {
              kicker: "The Catalogue",
              title: "All Books",
              intro: "Every photobook in the archive. Artists and publishers from around the world."
            }
          ),
          /* @__PURE__ */ jsx("div", { id: BOOKS_CATALOG_TARGET_ID, children: /* @__PURE__ */ jsx(
            BooksGridWithFilters,
            {
              user,
              tag,
              query,
              sort,
              defaultSort: BOOK_CATALOG_DEFAULT_SORT,
              currentPath,
              result,
              isFiltered
            }
          ) })
        ] })
      }
    )
  );
});
export {
  GET
};
