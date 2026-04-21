import { createRoute } from "hono-fsr";
import { paginationRequestBaseUrl } from "../../../../lib/pagination";
import InterviewsTableAndFilter from "../../../../features/dashboard/admin/interviews/components/InterviewsTableAdmin";

export const GET = createRoute(async (c) => {
  const rawStatusType = c.req.query("statusType");
  const statusType =
    rawStatusType === "published" ||
    rawStatusType === "sent" ||
    rawStatusType === "completed" ||
    rawStatusType === "expired"
      ? rawStatusType
      : undefined;
  const currentPage = Number(c.req.query("page") ?? 1);
  const searchQuery = c.req.query("search");
  const creatorsPaginationBaseUrl = paginationRequestBaseUrl(c.req.url);

  return c.html(
    <InterviewsTableAndFilter
      statusType={statusType}
      currentPage={currentPage}
      searchQuery={searchQuery}
      currentPath={creatorsPaginationBaseUrl}
    />,
  );
});
