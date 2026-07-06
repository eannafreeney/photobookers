import { jsx } from "hono/jsx/jsx-runtime";
import {
  getTopBooksByClicks
} from "../../purchase-clicks/services.js";
import TopBooksByClickTable from "../admin/components/TopBooksByClickTable.js";
const TopBooksByClicksSection = async ({
  dateRange,
  currentPath,
  currentPage,
  pageParam,
  scope = null
}) => {
  const [error, result] = await getTopBooksByClicks(
    dateRange,
    currentPage,
    10,
    scope
  );
  if (error) return /* @__PURE__ */ jsx("div", { children: error.reason });
  const targetId = scope ? "creator-analytics-top-books-by-clicks" : "analytics-top-books";
  const { books, totalPages, page } = result;
  return /* @__PURE__ */ jsx(
    TopBooksByClickTable,
    {
      currentPath,
      pageParam,
      books,
      totalPages,
      page,
      targetId
    }
  );
};
var TopBooksByClicksSection_default = TopBooksByClicksSection;
export {
  TopBooksByClicksSection_default as default
};
