import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils.js";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import ClaimsTable from "../../../../features/dashboard/admin/claims/components/ClaimsTable.js";
import Sidebar from "../../../../components/app/Sidebar.js";
import Page from "../../../../components/layouts/Page.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  return c.html(
    /* @__PURE__ */ jsx(AppLayout, { title: "Admin Dashboard", user, currentPath, children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(Sidebar, { currentPath, children: /* @__PURE__ */ jsx(ClaimsTable, {}) }) }) })
  );
});
export {
  GET
};
