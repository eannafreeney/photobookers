import { createRoute } from "hono-fsr";
import AppLayout from "../../../../components/layouts/AppLayout";
import { getFlash, getUser } from "../../../../utils";
import Page from "../../../../components/layouts/Page";
import AdminBooksTableContainer from "../../../../features/dashboard/admin/books/components/AdminBooksTableContainer";
import { Context } from "hono";
import Sidebar from "../../../../components/app/Sidebar";
import { paginationRequestBaseUrl } from "../../../../lib/pagination";
import { getIsMobile } from "../../../../lib/device";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const searchQuery = c.req.query("search");
  const flash = await getFlash(c);
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;
  const booksPaginationBaseUrl = paginationRequestBaseUrl(c.req.url);
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");

  return c.html(
    <AppLayout
      title="Books"
      user={user}
      flash={flash}
      currentPath={currentPath}
    >
      <Page>
        <Sidebar currentPath={currentPath}>
          <AdminBooksTableContainer
            user={user}
            currentPath={booksPaginationBaseUrl}
            currentPage={currentPage}
            searchQuery={searchQuery}
            isMobile={isMobile}
          />
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});
