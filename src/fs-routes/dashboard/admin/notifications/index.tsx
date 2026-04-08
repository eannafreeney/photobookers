import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils";
import Page from "../../../../components/layouts/Page";
import AppLayout from "../../../../components/layouts/AppLayout";
import NavTabs from "../../../../features/dashboard/admin/components/NavTabs";
import NotificationsTableAdmin from "../../../../features/dashboard/admin/notifications/components/NotificationsTableAdmin";

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
        <NavTabs currentPath={currentPath} />
        <NotificationsTableAdmin
          currentPath={currentPath}
          currentPage={currentPage}
        />
      </Page>
    </AppLayout>,
  );
});
