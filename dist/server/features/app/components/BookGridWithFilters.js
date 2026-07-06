import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../components/app/Button.js";
import BookFilters from "./BookFilters.js";
import BooksGrid from "./BooksGrid.js";
const BooksGridWithFilters = ({
  user,
  tag,
  query,
  sort,
  defaultSort = "newest",
  currentPath,
  result,
  isFiltered,
  isInfiniteScroll = true,
  ajaxPath = "/books",
  historyPath = "/books",
  hasMore = false,
  viewAllHref
}) => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    BookFilters,
    {
      activeTag: tag,
      query,
      sort,
      defaultSort,
      ajaxPath,
      historyPath
    }
  ),
  /* @__PURE__ */ jsx(
    BooksGrid,
    {
      isInfiniteScroll,
      isPaginated: isInfiniteScroll,
      user,
      currentPath,
      result,
      noResultsMessage: isFiltered ? "No books match your filters." : void 0
    }
  ),
  hasMore || viewAllHref ? /* @__PURE__ */ jsx("div", { class: "mt-8 flex justify-center", children: /* @__PURE__ */ jsx("a", { href: viewAllHref, children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "xl", children: "View All Books \u2192" }) }) }) : null
] });
var BookGridWithFilters_default = BooksGridWithFilters;
export {
  BookGridWithFilters_default as default
};
