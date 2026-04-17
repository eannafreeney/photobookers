import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import InterviewsTableAdmin from "../../../../features/dashboard/admin/interviews/components/InterviewsTableAdmin";
import Sidebar from "../../../../components/app/Sidebar";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);

  return c.html(
    <AppLayout title="Admin Interviews" user={user} currentPath={currentPath}>
      <Page>
        <Sidebar currentPath={currentPath}>
          <InterviewsTableAdmin
            currentPath={currentPath}
            currentPage={currentPage}
          />
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});
