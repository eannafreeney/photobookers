import { createRoute } from "hono-fsr";
import { Context } from "hono";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import Sidebar from "../../../../components/app/Sidebar";
import PageHeader from "@/components/app/PageHeader";
import { getFlash, getUser } from "../../../../utils";
import { listPublicListsForAdmin } from "../../../../domain/lists/services";
import InfoPage from "../../../../pages/InfoPage";
import AdminListsTable from "../../../../features/dashboard/admin/lists/AdminListsTable";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const searchQuery = c.req.query("search");
  const currentPage = Number(c.req.query("page") ?? 1);

  const [error, result] = await listPublicListsForAdmin(
    currentPage,
    searchQuery,
  );
  if (error || !result) {
    return c.html(
      <InfoPage errorMessage={error?.reason ?? "Failed to load lists"} user={user} />,
    );
  }

  return c.html(
    <AppLayout
      title="Lists"
      user={user}
      flash={flash}
      currentPath={currentPath}
    >
      <Page>
        <Sidebar currentPath={currentPath}>
          <PageHeader
            title="Lists"
            intro="Promote public collector lists to the homepage."
          />
          <form method="get" action="/dashboard/admin/lists" class="mb-4 flex gap-2">
            <input
              type="search"
              name="search"
              value={searchQuery ?? ""}
              placeholder="Search by title"
              class="rounded-radius border border-outline bg-surface px-3 py-2 text-sm"
            />
            <button
              type="submit"
              class="rounded-radius border border-outline px-3 py-2 text-sm"
            >
              Search
            </button>
          </form>
          <AdminListsTable lists={result.lists} />
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});
