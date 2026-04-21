import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import InterviewsTableAdmin from "../../../../features/dashboard/admin/interviews/components/InterviewsTableAdmin";
import Sidebar from "../../../../components/app/Sidebar";
import { paginationRequestBaseUrl } from "../../../../lib/pagination";
import InterviewsTableContainer from "../../../../features/dashboard/admin/interviews/components/InterviewsTableContainer";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const searchQuery = c.req.query("search");
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;
  const interviewsPaginationBaseUrl = paginationRequestBaseUrl(c.req.url);

  return c.html(
    <AppLayout title="Interviews" user={user} currentPath={currentPath}>
      <Page>
        <Sidebar currentPath={currentPath}>
          <InterviewsTableContainer
            searchQuery={searchQuery}
            currentPage={currentPage}
            currentPath={interviewsPaginationBaseUrl}
          />
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});
