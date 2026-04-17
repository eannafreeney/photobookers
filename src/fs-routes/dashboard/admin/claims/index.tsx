import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils";
import AppLayout from "../../../../components/layouts/AppLayout";
import ClaimsTable from "../../../../features/dashboard/admin/claims/components/ClaimsTable";
import Sidebar from "../../../../components/app/Sidebar";
import Page from "../../../../components/layouts/Page";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;

  return c.html(
    <AppLayout title="Admin Dashboard" user={user} currentPath={currentPath}>
      <Page>
        <Sidebar currentPath={currentPath}>
          <ClaimsTable />
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});
