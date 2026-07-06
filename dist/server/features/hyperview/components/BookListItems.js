import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  Item,
  List,
  Spinner,
  Style,
  Text,
  View
} from "../../../lib/hxml-comps.js";
import BookCard from "./BookCard.js";
const PREFETCH_OFFSET = 500;
const BooksListItems = ({
  books,
  baseUrl,
  favoritesByBookId,
  page,
  hasMore,
  loadMorePath
}) => /* @__PURE__ */ jsxs(Fragment, { children: [
  books.map((book) => /* @__PURE__ */ jsx(
    Item,
    {
      itemKey: book.id,
      style: "books-list-item",
      id: `book-${book.id}`,
      children: /* @__PURE__ */ jsx(
        BookCard,
        {
          book,
          baseUrl,
          isFavorited: favoritesByBookId[book.id] ?? false
        }
      )
    },
    book.id
  )),
  hasMore ? /* @__PURE__ */ jsxs(
    Item,
    {
      itemKey: `load-more-${page}`,
      style: "books-list-spinner",
      trigger: "visible",
      once: "true",
      verb: "get",
      href: `${loadMorePath}${loadMorePath.includes("?") ? "&" : "?"}page=${page + 1}`,
      action: "replace",
      children: [
        /* @__PURE__ */ jsx(View, { style: "books-list-prefetch" }),
        /* @__PURE__ */ jsx(Spinner, {})
      ]
    },
    `load-more-${page}`
  ) : null
] });
var BookListItems_default = BooksListItems;
const BooksList = ({
  listId = "books-list",
  refreshHref,
  children,
  emptyMessage,
  ...itemsProps
}) => /* @__PURE__ */ jsxs(
  List,
  {
    id: listId,
    style: "books-list",
    trigger: "refresh",
    href: refreshHref,
    action: "replace",
    children: [
      children ? /* @__PURE__ */ jsx(
        Item,
        {
          itemKey: "book-filters-header",
          style: "books-list-filters-header",
          sticky: "true",
          children
        }
      ) : null,
      emptyMessage ? /* @__PURE__ */ jsx(Item, { itemKey: "books-list-empty", style: "books-list-empty-item", children: /* @__PURE__ */ jsx(Text, { style: "featured-empty-hint", children: emptyMessage }) }) : /* @__PURE__ */ jsx(BooksListItems, { ...itemsProps })
    ]
  }
);
const bookListItemsStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(Style, { id: "books-list", flex: 1 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "books-list-filters-header",
      flexShrink: 0,
      width: "100%",
      backgroundColor: "#FFFFFF"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "books-list-empty-item",
      paddingTop: 24,
      paddingLeft: 16,
      paddingRight: 16
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "books-list-item", paddingLeft: 16, paddingRight: 16 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "books-list-spinner",
      alignItems: "center",
      justifyContent: "flex-end",
      paddingBottom: 16
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "books-list-prefetch", minHeight: PREFETCH_OFFSET, width: "100%" })
] });
export {
  BooksList,
  bookListItemsStyles,
  BookListItems_default as default
};
