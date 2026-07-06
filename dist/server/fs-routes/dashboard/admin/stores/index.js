import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import { getFlash, getUser } from "../../../../utils.js";
import Page from "../../../../components/layouts/Page.js";
import AdminStoresTableContainer from "../../../../features/dashboard/admin/stores/components/AdminStoresTableContainer.js";
import Sidebar from "../../../../components/app/Sidebar.js";
import { paginationRequestBaseUrl } from "../../../../lib/pagination.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const searchQuery = c.req.query("search");
  const flash = await getFlash(c);
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;
  const storesPaginationBaseUrl = paginationRequestBaseUrl(c.req.url);
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Bookstores",
        user,
        flash,
        currentPath,
        children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(Sidebar, { currentPath, children: /* @__PURE__ */ jsx(
          AdminStoresTableContainer,
          {
            user,
            currentPath: storesPaginationBaseUrl,
            currentPage,
            searchQuery
          }
        ) }) })
      }
    )
  );
});
export {
  GET
};
