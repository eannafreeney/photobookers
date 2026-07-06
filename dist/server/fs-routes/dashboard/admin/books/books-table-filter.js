import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils.js";
import AdminBooksTableAndFilter from "../../../../features/dashboard/admin/books/components/AdminBooksTableAndFilter.js";
const GET = createRoute(async (c) => {
  const rawStatus = c.req.query("status");
  const status = rawStatus === "approved" || rawStatus === "pending" || rawStatus === "rejected" ? rawStatus : void 0;
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;
  const searchQuery = c.req.query("search");
  const user = await getUser(c);
  return c.html(
    /* @__PURE__ */ jsx(
      AdminBooksTableAndFilter,
      {
        user,
        status,
        currentPage,
        searchQuery,
        currentPath
      }
    )
  );
});
export {
  GET
};
