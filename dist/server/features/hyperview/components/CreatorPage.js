import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Spinner, Style } from "../../../lib/hxml-comps.js";
import BookCard from "./BookCard.js";
const CREATOR_BOOKS_LOAD_MORE_ID = "creator-books-load-more";
const CreatorPage = ({
  books,
  creator,
  baseUrl,
  favoritesByBookId,
  page = 1,
  hasMore = false,
  loadMoreHref
}) => {
  return /* @__PURE__ */ jsxs("view", { xmlns: "https://hyperview.org/hyperview", children: [
    books.map((book) => /* @__PURE__ */ jsx(
      BookCard,
      {
        book,
        baseUrl,
        currentCreatorId: creator?.id,
        isFavorited: favoritesByBookId[book.id] ?? false
      },
      book.id
    )),
    hasMore && loadMoreHref ? /* @__PURE__ */ jsx(
      "view",
      {
        id: CREATOR_BOOKS_LOAD_MORE_ID,
        style: "creator-books-spinner",
        trigger: "visible",
        once: "true",
        verb: "get",
        href: `${loadMoreHref}?page=${page + 1}`,
        action: "replace",
        children: /* @__PURE__ */ jsx(Spinner, {})
      }
    ) : null
  ] });
};
var CreatorPage_default = CreatorPage;
const creatorPageStyles = () => /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
  Style,
  {
    id: "creator-books-spinner",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
    paddingBottom: 16
  }
) });
export {
  CREATOR_BOOKS_LOAD_MORE_ID,
  creatorPageStyles,
  CreatorPage_default as default
};
