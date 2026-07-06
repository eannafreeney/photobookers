import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getFilteredBooks } from "../../../features/app/services.js";
import { AppLayout } from "../+layout.js";
import { hyperview } from "../../../lib/hxml.js";
import { bookCardStyles } from "../../../features/hyperview/components/BookCard.js";
import { Items, Text, View, Item } from "../../../lib/hxml-comps.js";
import { getBaseUrl } from "../../../lib/hyperview.js";
import { getUser } from "../../../utils.js";
import { favoriteFlagsForBooks } from "../../../features/hyperview/findFlags.js";
import BooksListItems, {
  BooksList,
  bookListItemsStyles
} from "../../../features/hyperview/components/BookListItems.js";
import ErrorScreen from "../../../features/hyperview/components/ErrorScreen.js";
import {
  BOOKS_CATALOG_TARGET_ID,
  BOOKS_LIST_TARGET_ID,
  bookFiltersStyles
} from "../../../features/hyperview/components/BookFiltersPanel.js";
import { signInEmptyHintStyles } from "../../../features/hyperview/hyperviewCommonScreenStyles.js";
import {
  BOOK_CATALOG_DEFAULT_SORT
} from "../../../lib/bookCatalogSort.js";
import { hyperviewBooksFilterUrl, resolveBookCatalogSort } from "../../../lib/tags.js";
import BookFiltersPanel from "../../../features/hyperview/components/BookFiltersPanel.js";
const PAGE_SIZE = 3;
const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const tag = c.req.query("tag") ?? null;
  const q = c.req.query("q") ?? null;
  const sort = resolveBookCatalogSort(
    c.req.query("sort"),
    BOOK_CATALOG_DEFAULT_SORT
  );
  const isListFragment = c.req.query("fragment") === "list";
  const isCatalogFragment = c.req.query("fragment") === "catalog";
  const currentPage = isListFragment ? 1 : parseInt(c.req.query("page") ?? "1");
  const isFiltered = Boolean(tag?.trim() || (q?.trim()?.length ?? 0) >= 3);
  const [error, result] = await getFilteredBooks({
    tag,
    query: q,
    page: currentPage,
    limit: PAGE_SIZE,
    sort
  });
  if (error) {
    return hv(
      /* @__PURE__ */ jsx(ErrorScreen, { user, baseUrl, message: error.reason })
    );
  }
  const books = result?.books ?? [];
  const totalPages = result?.totalPages ?? 1;
  const listProps = await buildListProps(
    user,
    baseUrl,
    books,
    currentPage,
    totalPages,
    { tag, q, sort }
  );
  if (isCatalogFragment) {
    return hv(
      renderBooksCatalog(baseUrl, tag, q, sort, listProps, isFiltered)
    );
  }
  if (isListFragment) {
    return hv(
      /* @__PURE__ */ jsxs(Items, { children: [
        /* @__PURE__ */ jsx(
          Item,
          {
            itemKey: "book-filters-header",
            style: "books-list-filters-header",
            sticky: "true",
            children: /* @__PURE__ */ jsx(
              BookFiltersPanel,
              {
                baseUrl,
                activeTag: tag,
                q,
                sort,
                defaultSort: BOOK_CATALOG_DEFAULT_SORT
              }
            )
          }
        ),
        /* @__PURE__ */ jsx(BooksListItems, { ...listProps })
      ] })
    );
  }
  if (currentPage > 1) {
    return hv(
      /* @__PURE__ */ jsx(Items, { children: /* @__PURE__ */ jsx(BooksListItems, { ...listProps }) })
    );
  }
  return hv(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        showDock: true,
        nativeList: true,
        title: "All Books",
        user,
        dockActive: "books",
        baseUrl,
        extraStyles: pageStyles(),
        dockScrollRefreshHref: hyperviewBooksFilterUrl(baseUrl, {
          tag,
          query: q,
          sort,
          defaultSort: BOOK_CATALOG_DEFAULT_SORT
        }),
        children: renderBooksCatalog(baseUrl, tag, q, sort, listProps, isFiltered)
      }
    )
  );
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
    BOOK_CATALOG_DEFAULT_SORT
  );
  const isFiltered = Boolean(tag || q.length >= 3);
  const [error, result] = await getFilteredBooks({
    tag,
    query: q,
    page: 1,
    limit: PAGE_SIZE,
    sort
  });
  if (error || !result) {
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
  const books = result.books ?? [];
  const listProps = await buildListProps(
    user,
    baseUrl,
    books,
    result.page ?? 1,
    result.totalPages ?? 1,
    { tag, q, sort }
  );
  return hv(renderBooksCatalog(baseUrl, tag, q, sort, listProps, isFiltered));
});
const pageStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  signInEmptyHintStyles(),
  bookFiltersStyles(),
  bookCardStyles(),
  bookListItemsStyles()
] });
const buildListProps = async (user, baseUrl, books, page, totalPages, filters) => {
  const loadMorePath = hyperviewBooksFilterUrl(baseUrl, {
    tag: filters.tag,
    query: filters.q,
    sort: filters.sort,
    defaultSort: BOOK_CATALOG_DEFAULT_SORT
  });
  const hasMore = page < totalPages;
  const favoritesByBookId = await favoriteFlagsForBooks(user, books);
  const refreshHref = `${loadMorePath}${loadMorePath.includes("?") ? "&" : "?"}fragment=list`;
  return {
    books,
    baseUrl,
    favoritesByBookId,
    page,
    hasMore,
    loadMorePath,
    refreshHref
  };
};
const renderBooksListHost = (baseUrl, tag, q, sort, listProps, isFiltered) => {
  return /* @__PURE__ */ jsx(
    View,
    {
      id: BOOKS_LIST_TARGET_ID,
      xmlns: "https://hyperview.org/hyperview",
      style: "books-list-panel",
      children: /* @__PURE__ */ jsx(
        BooksList,
        {
          ...listProps,
          emptyMessage: isFiltered && listProps.books.length === 0 ? "No books match your filters." : void 0,
          children: /* @__PURE__ */ jsx(
            BookFiltersPanel,
            {
              baseUrl,
              activeTag: tag,
              q,
              sort,
              defaultSort: BOOK_CATALOG_DEFAULT_SORT
            }
          )
        }
      )
    }
  );
};
const renderBooksCatalog = (baseUrl, tag, q, sort, listProps, isFiltered) => /* @__PURE__ */ jsx(
  View,
  {
    id: BOOKS_CATALOG_TARGET_ID,
    style: "books-catalog-shell",
    xmlns: "https://hyperview.org/hyperview",
    children: renderBooksListHost(baseUrl, tag, q, sort, listProps, isFiltered)
  }
);
export {
  GET,
  POST
};
