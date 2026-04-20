import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import CreateUserFormAdmin from "../../../../features/dashboard/admin/users/forms/CreateUserFormAdmin";
import UsersTableAdmin from "../../../../features/dashboard/admin/users/components/UsersTableAdmin";
import Sidebar from "../../../../components/app/Sidebar";
import { paginationRequestBaseUrl } from "../../../../lib/pagination";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const searchQuery = c.req.query("search");
  const currentPage = Number(c.req.query("page") ?? 1);
  const usersPaginationBaseUrl = paginationRequestBaseUrl(c.req.url);
  const currentPath = c.req.path;

  return c.html(
    <AppLayout title="Users" user={user} currentPath={currentPath}>
      <Page>
        <Sidebar currentPath={currentPath}>
          <div class="flex flex-col gap-4">
            <CreateUserFormAdmin />
            <UsersTableAdmin
              currentPage={currentPage}
              searchQuery={searchQuery}
              currentPath={usersPaginationBaseUrl}
            />
          </div>
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});
