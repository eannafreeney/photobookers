import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import Page from "../../../../components/layouts/Page.js";
import Sidebar from "../../../../components/app/Sidebar.js";
import MagazineTable from "../../../../features/dashboard/admin/magazine/components/MagazineOverview.js";
import { listAllIssuesForAdmin } from "../../../../domain/magazine/queries.js";
import { getFlash, getUser } from "../../../../utils.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const [error, issues] = await listAllIssuesForAdmin();
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Magazine",
        user,
        flash,
        currentPath,
        children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(Sidebar, { currentPath, children: error ? /* @__PURE__ */ jsx("p", { class: "text-danger", children: error.reason }) : /* @__PURE__ */ jsx(MagazineTable, { issues }) }) })
      }
    )
  );
});
export {
  GET
};
