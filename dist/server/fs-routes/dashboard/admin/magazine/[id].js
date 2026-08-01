import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import Page from "../../../../components/layouts/Page.js";
import Sidebar from "../../../../components/app/Sidebar.js";
import InfoPage from "../../../../pages/InfoPage.js";
import { AdminIssueEditor } from "../../../../features/dashboard/admin/magazine/components/AdminMagazine.js";
import { getIssueByIdForAdmin } from "../../../../domain/magazine/queries.js";
import { nextIssueNumber } from "../../../../domain/magazine/mutations.js";
import { paramValidator } from "../../../../lib/validator.js";
import { idSchema } from "../../../../features/app/schema.js";
import { getFlash, getUser } from "../../../../utils.js";
const GET = createRoute(
  paramValidator(idSchema),
  async (c) => {
    const user = await getUser(c);
    const flash = await getFlash(c);
    const currentPath = c.req.path;
    const id = c.req.valid("param").id;
    const [error, issue] = await getIssueByIdForAdmin(id);
    if (error || !issue) {
      return c.html(
        /* @__PURE__ */ jsx(InfoPage, { errorMessage: error?.reason ?? "Not found", user }),
        404
      );
    }
    const nextNumber = await nextIssueNumber();
    return c.html(
      /* @__PURE__ */ jsx(
        AppLayout,
        {
          title: `Magazine \u2014 ${issue.title}`,
          user,
          flash,
          currentPath,
          children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(Sidebar, { currentPath, children: /* @__PURE__ */ jsx(AdminIssueEditor, { issue, nextNumber }) }) })
        }
      )
    );
  }
);
export {
  GET
};
