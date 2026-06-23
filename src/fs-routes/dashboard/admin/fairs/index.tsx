import { createRoute } from "hono-fsr";
import AppLayout from "../../../../components/layouts/AppLayout";
import { getFlash, getUser } from "../../../../utils";
import Page from "../../../../components/layouts/Page";
import AdminFairsTableContainer from "../../../../features/dashboard/admin/fairs/components/AdminFairsTableContainer";
import { Context } from "hono";
import Sidebar from "../../../../components/app/Sidebar";
import { paginationRequestBaseUrl } from "../../../../lib/pagination";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const searchQuery = c.req.query("search");
  const flash = await getFlash(c);
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;
  const fairsPaginationBaseUrl = paginationRequestBaseUrl(c.req.url);

  return c.html(
    <AppLayout
      title="Book Fairs"
      user={user}
      flash={flash}
      currentPath={currentPath}
    >
      <Page>
        <Sidebar currentPath={currentPath}>
          <AdminFairsTableContainer
            user={user}
            currentPath={fairsPaginationBaseUrl}
            currentPage={currentPage}
            searchQuery={searchQuery}
          />
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});
