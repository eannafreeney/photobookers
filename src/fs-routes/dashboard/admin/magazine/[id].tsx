import { createRoute } from "hono-fsr";
import { Context } from "hono";
import AppLayout from "@/components/layouts/AppLayout";
import Page from "@/components/layouts/Page";
import Sidebar from "@/components/app/Sidebar";
import InfoPage from "@/pages/InfoPage";
import { AdminIssueEditor } from "@/features/dashboard/admin/magazine/components/AdminMagazine";
import { getIssueByIdForAdmin } from "@/domain/magazine/queries";
import { nextIssueNumber } from "@/domain/magazine/mutations";
import { getFlash, getUser } from "@/utils";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const id = c.req.param("id");

  const [error, issue] = id
    ? await getIssueByIdForAdmin(id)
    : [{ reason: "Not found" }, null];
  if (error || !issue) {
    return c.html(
      <InfoPage errorMessage={error?.reason ?? "Not found"} user={user} />,
      404,
    );
  }

  const nextNumber = await nextIssueNumber();

  return c.html(
    <AppLayout
      title={`Magazine — ${issue.title}`}
      user={user}
      flash={flash}
      currentPath={currentPath}
    >
      <Page>
        <Sidebar currentPath={currentPath}>
          <AdminIssueEditor issue={issue} nextNumber={nextNumber} />
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});
