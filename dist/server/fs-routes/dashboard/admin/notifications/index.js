import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils.js";
import Page from "../../../../components/layouts/Page.js";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import NotificationsTableAdmin from "../../../../features/dashboard/admin/notifications/components/NotificationsTableAdmin.js";
import Sidebar from "../../../../components/app/Sidebar.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Admin Notifications",
        user,
        currentPath,
        children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(Sidebar, { currentPath, children: /* @__PURE__ */ jsx(
          NotificationsTableAdmin,
          {
            currentPath,
            currentPage
          }
        ) }) })
      }
    )
  );
});
export {
  GET
};
