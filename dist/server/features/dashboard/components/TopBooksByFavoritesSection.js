import { jsx } from "hono/jsx/jsx-runtime";
import {
  getTopBooksByFavorites
} from "../../book-analytics/engagement.js";
import TopBooksByFavoritesTable from "../admin/components/TopBooksByFavoritesTable.js";
const TopBooksByFavoritesSection = async ({
  dateRange,
  currentPath,
  currentPage,
  pageParam,
  scope = null
}) => {
  const [error, result] = await getTopBooksByFavorites(
    dateRange,
    currentPage,
    10,
    scope
  );
  if (error) return /* @__PURE__ */ jsx("div", { children: error.reason });
  const targetId = scope ? "creator-analytics-top-books-by-favorites" : "analytics-top-books-by-favorites";
  const navId = scope ? "pagination-creator-top-books-by-favorites-table" : "pagination-top-books-by-favorites-table";
  const { books, totalPages, page } = result;
  return /* @__PURE__ */ jsx(
    TopBooksByFavoritesTable,
    {
      currentPath,
      pageParam,
      books,
      totalPages,
      page,
      targetId,
      navId
    }
  );
};
var TopBooksByFavoritesSection_default = TopBooksByFavoritesSection;
export {
  TopBooksByFavoritesSection_default as default
};
