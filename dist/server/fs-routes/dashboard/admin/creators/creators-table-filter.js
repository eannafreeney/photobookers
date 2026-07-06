import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paginationRequestBaseUrl } from "../../../../lib/pagination.js";
import AdminCreatorsTableAndFilter from "../../../../features/dashboard/admin/creators/components/AdminCreatorsTableAndFilter.js";
const GET = createRoute(async (c) => {
  const rawType = c.req.query("type");
  const type = rawType === "artist" || rawType === "publisher" ? rawType : void 0;
  const currentPage = Number(c.req.query("page") ?? 1);
  const searchQuery = c.req.query("search");
  const creatorsPaginationBaseUrl = paginationRequestBaseUrl(c.req.url);
  return c.html(
    /* @__PURE__ */ jsx(
      AdminCreatorsTableAndFilter,
      {
        type,
        currentPage,
        searchQuery,
        currentPath: creatorsPaginationBaseUrl
      }
    )
  );
});
export {
  GET
};
