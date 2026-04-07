import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils";
import { Context } from "hono";
import AdminBooksTableAndFilter from "../../../../features/dashboard/admin/books/components/AdminBooksTableAndFilter";

export const GET = createRoute(async (c: Context) => {
  const rawStatus = c.req.query("status");
  const status =
    rawStatus === "approved" ||
    rawStatus === "pending" ||
    rawStatus === "rejected"
      ? rawStatus
      : undefined;
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;
  const searchQuery = c.req.query("search");
  const user = await getUser(c);

  return c.html(
    <AdminBooksTableAndFilter
      user={user}
      status={status}
      currentPage={currentPage}
      searchQuery={searchQuery}
      currentPath={currentPath}
    />,
  );
});
