import { jsx } from "hono/jsx/jsx-runtime";
import { InfiniteScroll } from "../../../components/app/InfiniteScroll.js";
import { Pagination } from "../../../components/app/Pagination.js";
const ListNavigation = ({
  isInfiniteScroll = false,
  currentPath,
  page,
  totalPages,
  targetId,
  pageParam = "page",
  navId = "pagination"
}) => {
  return isInfiniteScroll ? /* @__PURE__ */ jsx(
    InfiniteScroll,
    {
      baseUrl: currentPath,
      page,
      totalPages,
      targetId,
      pageParam,
      navId
    }
  ) : /* @__PURE__ */ jsx(
    Pagination,
    {
      baseUrl: currentPath,
      page,
      totalPages,
      targetId,
      pageParam,
      navId
    }
  );
};
var ListNavigation_default = ListNavigation;
export {
  ListNavigation_default as default
};
