import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils";
import Page from "../../../../components/layouts/Page";
import AppLayout from "../../../../components/layouts/AppLayout";
import NotificationsTableAdmin from "../../../../features/dashboard/admin/notifications/components/NotificationsTableAdmin";
import Sidebar from "../../../../components/app/Sidebar";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);

  return c.html(
    <AppLayout
      title="Admin Notifications"
      user={user}
      currentPath={currentPath}
    >
      <Page>
        <Sidebar currentPath={currentPath}>
          <NotificationsTableAdmin
            currentPath={currentPath}
            currentPage={currentPage}
          />
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});
