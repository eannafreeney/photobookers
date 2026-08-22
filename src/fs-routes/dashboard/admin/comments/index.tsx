import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import Sidebar from "../../../../components/app/Sidebar";
import { paginationRequestBaseUrl } from "../../../../lib/pagination";
import CommentsTableContainer from "../../../../features/dashboard/admin/comments/components/CommentsTableContainer";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const searchQuery = c.req.query("search");
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;
  const commentsPaginationBaseUrl = paginationRequestBaseUrl(c.req.url);

  return c.html(
    <AppLayout title="Comments" user={user} currentPath={currentPath}>
      <Page>
        <Sidebar currentPath={currentPath}>
          <CommentsTableContainer
            searchQuery={searchQuery}
            currentPage={currentPage}
            currentPath={commentsPaginationBaseUrl}
          />
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});
