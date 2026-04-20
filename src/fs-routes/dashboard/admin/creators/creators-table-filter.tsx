import { createRoute } from "hono-fsr";
import { paginationRequestBaseUrl } from "../../../../lib/pagination";
import AdminCreatorsTableAndFilter from "../../../../features/dashboard/admin/creators/components/AdminCreatorsTableAndFilter";

export const GET = createRoute(async (c) => {
  const rawType = c.req.query("type");
  const type =
    rawType === "artist" || rawType === "publisher" ? rawType : undefined;
  const currentPage = Number(c.req.query("page") ?? 1);
  const searchQuery = c.req.query("search");
  const creatorsPaginationBaseUrl = paginationRequestBaseUrl(c.req.url);

  return c.html(
    <AdminCreatorsTableAndFilter
      type={type}
      currentPage={currentPage}
      searchQuery={searchQuery}
      currentPath={creatorsPaginationBaseUrl}
    />,
  );
});
