import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paginationRequestBaseUrl } from "../../../../lib/pagination.js";
import InterviewsTableAndFilter from "../../../../features/dashboard/admin/interviews/components/InterviewsTableAdmin.js";
const GET = createRoute(async (c) => {
  const rawStatusType = c.req.query("statusType");
  const statusType = rawStatusType === "published" || rawStatusType === "sent" || rawStatusType === "completed" || rawStatusType === "expired" ? rawStatusType : void 0;
  const currentPage = Number(c.req.query("page") ?? 1);
  const searchQuery = c.req.query("search");
  const creatorsPaginationBaseUrl = paginationRequestBaseUrl(c.req.url);
  return c.html(
    /* @__PURE__ */ jsx(
      InterviewsTableAndFilter,
      {
        statusType,
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
