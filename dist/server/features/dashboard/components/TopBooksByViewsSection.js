import { jsx } from "hono/jsx/jsx-runtime";
import {
  getTopBooksByViews
} from "../../book-views/services.js";
import { findPurchaseClickCounts } from "../../purchase-clicks/services.js";
import TopBooksByViewsTable from "../admin/components/TopBooksByViewsTable.js";
const TopBooksByViewsSection = async ({
  dateRange,
  currentPath,
  currentPage,
  pageParam,
  scope = null
}) => {
  const [error, result] = await getTopBooksByViews(
    dateRange,
    currentPage,
    10,
    scope
  );
  if (error) return /* @__PURE__ */ jsx("div", { children: error.reason });
  const targetId = scope ? "creator-analytics-top-books-by-views" : "analytics-top-books-by-views";
  const { books, totalPages, page } = result;
  const clickCounts = await findPurchaseClickCounts(
    books.map((row) => row.bookId),
    dateRange
  );
  return /* @__PURE__ */ jsx(
    TopBooksByViewsTable,
    {
      currentPath,
      pageParam,
      books,
      totalPages,
      page,
      targetId,
      clickCounts
    }
  );
};
var TopBooksByViewsSection_default = TopBooksByViewsSection;
export {
  TopBooksByViewsSection_default as default
};
