import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  BOOK_CATALOG_DEFAULT_SORT
} from "../../../lib/bookCatalogSort.js";
import { getFilteredBooks } from "../../app/services.js";
import { favoriteFlagsForBooks } from "../findFlags.js";
import {
  hyperviewBooksFilterUrl,
  resolveBookCatalogSort
} from "../../../lib/tags.js";
import { ScrollView, Style, Text, View } from "../../../lib/hxml-comps.js";
import BookCard, { bookCardStyles } from "./BookCard.js";
import BookFiltersPanel, {
  BOOKS_CATALOG_TARGET_ID,
  bookFiltersStyles
} from "./BookFiltersPanel.js";
import SecondaryButtonLink, {
  secondaryButtonLinkStyles
} from "./SecondaryButtonLink.js";
import SectionHeader from "./SectionHeader.js";
const FEATURED_LATEST_BOOKS_TAB = "/hyperview/featured/tab/latest-books";
const FEATURED_LATEST_BOOKS_LIMIT = 5;
const FEATURED_LATEST_BOOKS_DEFAULT_SORT = BOOK_CATALOG_DEFAULT_SORT;
const FEATURED_LATEST_BOOKS_SCROLL_ID = "featured-latest-books-scroll";
const featuredLatestBooksFilterPath = (baseUrl) => `${baseUrl}${FEATURED_LATEST_BOOKS_TAB}`;
const FeaturedLatestBooksCatalogShell = ({
  baseUrl,
  tag,
  q,
  sort,
  defaultSort,
  ...catalogProps
}) => /* @__PURE__ */ jsxs(
  View,
  {
    id: BOOKS_CATALOG_TARGET_ID,
    style: "books-catalog-shell",
    xmlns: "https://hyperview.org/hyperview",
    children: [
      /* @__PURE__ */ jsx(
        BookFiltersPanel,
        {
          baseUrl,
          activeTag: tag,
          q,
          sort,
          defaultSort,
          filterPath: featuredLatestBooksFilterPath(baseUrl),
          scrollToTopTarget: FEATURED_LATEST_BOOKS_SCROLL_ID
        }
      ),
      /* @__PURE__ */ jsx(
        ScrollView,
        {
          id: FEATURED_LATEST_BOOKS_SCROLL_ID,
          style: "books-scroll",
          horizontal: "true",
          "shows-scroll-indicator": "false",
          children: /* @__PURE__ */ jsx(BookGridCatalog, { baseUrl, ...catalogProps })
        }
      ),
      catalogProps.hasMore && catalogProps.books.length > 0 ? /* @__PURE__ */ jsx(View, { style: "featured-books-see-all-wrap", children: /* @__PURE__ */ jsx(SecondaryButtonLink, { label: "See all", href: catalogProps.viewAllHref }) }) : null
    ]
  }
);
const loadFeaturedLatestBooksCatalog = async (user, baseUrl, tag = null, q = null, sortParam = null) => {
  const defaultSort = FEATURED_LATEST_BOOKS_DEFAULT_SORT;
  const sort = resolveBookCatalogSort(sortParam, defaultSort);
  const isFiltered = Boolean(tag?.trim() || (q?.trim()?.length ?? 0) >= 3);
  const [error, result] = await getFilteredBooks({
    tag,
    query: q,
    page: 1,
    limit: FEATURED_LATEST_BOOKS_LIMIT,
    sort
  });
  if (error || !result) return null;
  const favoritesByBookId = await favoriteFlagsForBooks(
    user ?? null,
    result.books
  );
  return {
    books: result.books,
    baseUrl,
    favoritesByBookId,
    isFiltered,
    hasMore: result.totalPages > 1,
    viewAllHref: hyperviewBooksFilterUrl(baseUrl, {
      tag,
      query: q,
      sort,
      defaultSort
    })
  };
};
const BookGridCatalog = ({
  books,
  baseUrl,
  favoritesByBookId,
  isFiltered
}) => /* @__PURE__ */ jsx(Fragment, { children: isFiltered && books.length === 0 ? /* @__PURE__ */ jsx(Text, { style: "featured-empty-hint", children: "No books match your filters." }) : books.map((book) => /* @__PURE__ */ jsx(View, { style: "featured-book-card-wrap", children: /* @__PURE__ */ jsx(
  BookCard,
  {
    book,
    baseUrl,
    isFavorited: favoritesByBookId[book.id] ?? false
  }
) }, book.id)) });
const BookGridWithFilters = ({
  baseUrl,
  tag,
  q,
  sort,
  defaultSort,
  ...catalogProps
}) => /* @__PURE__ */ jsxs(View, { style: "latest-books-section", children: [
  /* @__PURE__ */ jsx(
    SectionHeader,
    {
      title: "Latest Books",
      viewAllHref: catalogProps.viewAllHref
    }
  ),
  /* @__PURE__ */ jsx(
    FeaturedLatestBooksCatalogShell,
    {
      baseUrl,
      tag,
      q,
      sort,
      defaultSort,
      ...catalogProps
    }
  )
] });
const FeaturedLatestBooksSection = async ({
  baseUrl,
  user = null
}) => {
  const catalogProps = await loadFeaturedLatestBooksCatalog(user, baseUrl);
  if (!catalogProps) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsx(
    BookGridWithFilters,
    {
      ...catalogProps,
      tag: null,
      q: null,
      sort: FEATURED_LATEST_BOOKS_DEFAULT_SORT,
      defaultSort: FEATURED_LATEST_BOOKS_DEFAULT_SORT
    }
  );
};
var BookGridWithFilters_default = BookGridWithFilters;
const bookGridWithFiltersStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "latest-books-section",
      flexDirection: "column",
      gap: 0,
      marginBottom: 24
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "books-scroll", flexDirection: "row" }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "featured-book-card-wrap",
      width: 320,
      marginRight: 12,
      flexShrink: 0
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "featured-books-see-all-wrap", width: "100%", paddingTop: 12 }),
  bookFiltersStyles(),
  bookCardStyles(),
  secondaryButtonLinkStyles()
] });
export {
  BookGridCatalog,
  FEATURED_LATEST_BOOKS_DEFAULT_SORT,
  FeaturedLatestBooksCatalogShell,
  FeaturedLatestBooksSection,
  bookGridWithFiltersStyles,
  BookGridWithFilters_default as default,
  featuredLatestBooksFilterPath,
  loadFeaturedLatestBooksCatalog
};
