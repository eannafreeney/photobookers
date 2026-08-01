import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import Page from "../../../../components/layouts/Page.js";
import Sidebar from "../../../../components/app/Sidebar.js";
import { getFlash, getUser } from "../../../../utils.js";
import { paginationRequestBaseUrl } from "../../../../lib/pagination.js";
import AdminNewslettersTableContainer from "../../../../features/dashboard/admin/newsletters/components/AdminNewslettersTableContainer.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;
  const paginationBaseUrl = paginationRequestBaseUrl(c.req.url);
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Newsletters",
        user,
        flash,
        currentPath,
        children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(Sidebar, { currentPath, children: /* @__PURE__ */ jsx(
          AdminNewslettersTableContainer,
          {
            currentPath: paginationBaseUrl,
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
