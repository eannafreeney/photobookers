import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils";
import AdminCreatorsTableContainer from "../../../../features/dashboard/admin/creators/components/AdminCreatorsTableContainer";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import NavTabs from "../../../../features/dashboard/admin/components/NavTabs";
import AddCreatorFormAdmin from "../../../../features/dashboard/admin/creators/forms/AddCreatorFormAdmin";
import Sidebar from "../../../../components/app/Sidebar";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const searchQuery = c.req.query("search");
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;

  return c.html(
    <AppLayout title="New Creator" user={user} currentPath={currentPath}>
      <Page>
        <Sidebar currentPath={currentPath}>
          <AddCreatorFormAdmin />
          <AdminCreatorsTableContainer
            searchQuery={searchQuery}
            currentPage={currentPage}
            currentPath={currentPath}
          />
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});
