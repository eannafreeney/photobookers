import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import NavTabs from "../../../../features/dashboard/admin/components/NavTabs";
import InterviewsTableAdmin from "../../../../features/dashboard/admin/interviews/components/InterviewsTableAdmin";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);

  return c.html(
    <AppLayout title="Admin Interviews" user={user} currentPath={currentPath}>
      <Page>
        <NavTabs currentPath={currentPath} />
        <InterviewsTableAdmin
          currentPath={currentPath}
          currentPage={currentPage}
        />
      </Page>
    </AppLayout>,
  );
});
