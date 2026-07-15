import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { Env } from "hono/types";
import { z } from "zod";
import AppLayout from "@/components/layouts/AppLayout";
import Page from "@/components/layouts/Page";
import Sidebar from "@/components/app/Sidebar";
import InfoPage from "@/pages/InfoPage";
import { AdminIssueEditor } from "@/features/dashboard/admin/magazine/components/AdminMagazine";
import { getIssueByIdForAdmin } from "@/domain/magazine/queries";
import { nextIssueNumber } from "@/domain/magazine/mutations";
import { paramValidator } from "@/lib/validator";
import { idSchema } from "@/features/app/schema";
import { getFlash, getUser } from "@/utils";

type IdParamContext = Context<
  Env,
  string,
  { out: { param: z.infer<typeof idSchema> } }
>;

export const GET = createRoute(
  paramValidator(idSchema),
  async (c: IdParamContext) => {
    const user = await getUser(c);
    const flash = await getFlash(c);
    const currentPath = c.req.path;
    const id = c.req.valid("param").id;

    const [error, issue] = await getIssueByIdForAdmin(id);
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
  },
);
