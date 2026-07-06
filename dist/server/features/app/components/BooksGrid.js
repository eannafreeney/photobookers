import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import BookCard from "../../../components/app/BookCard.js";
import GridPanel from "../../../components/app/GridPanel.js";
import ScrollReveal from "../../../components/app/ScrollReveal.js";
import { BOOKS_LIST_TARGET_ID } from "./BookFilters.js";
import ListNavigation from "./ListNavigation.js";
const BooksGrid = async ({
  isFullWidth,
  currentPath,
  result,
  user,
  noResultsMessage = "No books found",
  currentCreatorId,
  isMobile = false,
  isPaginated = true,
  isInfiniteScroll = false
}) => {
  const { books, totalPages, page } = result;
  const targetId = "books-grid";
  const gridMerge = isMobile || isInfiniteScroll ? "append" : "replace";
  return /* @__PURE__ */ jsxs("div", { id: BOOKS_LIST_TARGET_ID, children: [
    /* @__PURE__ */ jsx(
      GridPanel,
      {
        id: targetId,
        isFullWidth,
        xMerge: gridMerge,
        "data-nav": isMobile || isInfiniteScroll ? "infinite" : "pagination",
        children: books?.length > 0 ? books.map((book) => /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(
          BookCard,
          {
            book,
            user,
            currentCreatorId
          }
        ) })) : /* @__PURE__ */ jsx("div", { class: "col-span-full text-center text-sm text-on-surface py-4", children: noResultsMessage })
      }
    ),
    isPaginated && /* @__PURE__ */ jsx(
      ListNavigation,
      {
        isInfiniteScroll: isMobile || isInfiniteScroll,
        currentPath,
        page,
        totalPages,
        targetId
      }
    )
  ] });
};
var BooksGrid_default = BooksGrid;
export {
  BooksGrid_default as default
};
