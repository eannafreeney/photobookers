import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import NavTabs from "../../../../features/dashboard/admin/components/NavTabs";
import CreateUserFormAdmin from "../../../../features/dashboard/admin/users/forms/CreateUserFormAdmin";
import UsersTableAdmin from "../../../../features/dashboard/admin/users/components/UsersTableAdmin";
import Sidebar from "../../../../components/app/Sidebar";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const searchQuery = c.req.query("search");
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;

  return c.html(
    <AppLayout title="Admin Dashboard" user={user} currentPath={currentPath}>
      <Page>
        <Sidebar currentPath={currentPath}>
          <CreateUserFormAdmin />
          <UsersTableAdmin
            currentPage={currentPage}
            searchQuery={searchQuery}
            currentPath={currentPath}
          />
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});
