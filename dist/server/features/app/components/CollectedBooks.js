import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import BookCard from "../../../components/app/BookCard.js";
import GridPanel from "../../../components/app/GridPanel.js";
import { getBooksInCollection } from "../services.js";
import ErrorPage from "../../../pages/error/errorPage.js";
import { Pagination } from "../../../components/app/Pagination.js";
const CollectedBooks = async ({ user, currentPage, currentPath }) => {
  const [error, result] = await getBooksInCollection(user.id, currentPage);
  if (error) {
    return /* @__PURE__ */ jsx(ErrorPage, { errorMessage: error.reason, user });
  }
  const targetId = "collection-books-grid";
  const { books, totalPages, page } = result;
  if (!books) {
    return /* @__PURE__ */ jsx(ErrorPage, { errorMessage: "No collected books found", user });
  }
  const attrs = {
    "x-init": true,
    "x-on:collection:updated.window": "$ajax('/collection-books', { target: 'collection-books-container', sync: true })"
  };
  return /* @__PURE__ */ jsx("div", { "x-data": true, children: /* @__PURE__ */ jsxs(
    "div",
    {
      id: "collection-books-container",
      "x-merge": "replace",
      ...attrs,
      "x-ref": "paginationContent",
      children: [
        /* @__PURE__ */ jsx("div", { children: (!books || books?.length === 0) && /* @__PURE__ */ jsx("div", { children: "Start adding books to your wishlist and collection to see them here." }) }),
        /* @__PURE__ */ jsx(GridPanel, { id: targetId, xMerge: "append", children: books?.map((book) => /* @__PURE__ */ jsx(BookCard, { book, user })) }),
        /* @__PURE__ */ jsx(
          Pagination,
          {
            baseUrl: currentPath,
            page,
            totalPages,
            targetId
          }
        )
      ]
    }
  ) });
};
var CollectedBooks_default = CollectedBooks;
export {
  CollectedBooks_default as default
};
