import { createRoute } from "hono-fsr";
import AppLayout from "../../../../components/layouts/AppLayout";
import { getFlash, getUser } from "../../../../utils";
import Page from "../../../../components/layouts/Page";
import AdminBooksTableContainer from "../../../../features/dashboard/admin/books/components/AdminBooksTableContainer";
import { Context } from "hono";
import Sidebar from "../../../../components/app/Sidebar";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const searchQuery = c.req.query("search");
  const flash = await getFlash(c);
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;

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
            currentPath={currentPath}
            currentPage={currentPage}
            searchQuery={searchQuery}
          />
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});
