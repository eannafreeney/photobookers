import { createRoute } from "hono-fsr";
import { Context } from "hono";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import Sidebar from "../../../../components/app/Sidebar";
import { getFlash, getUser } from "../../../../utils";
import { paginationRequestBaseUrl } from "../../../../lib/pagination";
import AdminNewslettersTableContainer from "../../../../features/dashboard/admin/newsletters/components/AdminNewslettersTableContainer";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;
  const paginationBaseUrl = paginationRequestBaseUrl(c.req.url);

  return c.html(
    <AppLayout
      title="Newsletters"
      user={user}
      flash={flash}
      currentPath={currentPath}
    >
      <Page>
        <Sidebar currentPath={currentPath}>
          <AdminNewslettersTableContainer
            currentPath={paginationBaseUrl}
            currentPage={currentPage}
          />
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});
