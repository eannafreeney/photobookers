import { createRoute } from "hono-fsr";
import { Context } from "hono";
import AppLayout from "@/components/layouts/AppLayout";
import Page from "@/components/layouts/Page";
import Sidebar from "@/components/app/Sidebar";
import MagazineTable from "@/features/dashboard/admin/magazine/components/MagazineOverview";
import { listAllIssuesForAdmin } from "@/domain/magazine/queries";
import { getFlash, getUser } from "@/utils";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;

  const [error, issues] = await listAllIssuesForAdmin();

  return c.html(
    <AppLayout
      title="Magazine"
      user={user}
      flash={flash}
      currentPath={currentPath}
    >
      <Page>
        <Sidebar currentPath={currentPath}>
          {error ? (
            <p class="text-danger">{error.reason}</p>
          ) : (
            <MagazineTable issues={issues} />
          )}
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});
