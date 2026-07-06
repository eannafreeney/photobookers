import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paginationRequestBaseUrl } from "../../../../lib/pagination.js";
import { getUser } from "../../../../utils.js";
import AdminCreatorsTableContainer from "../../../../features/dashboard/admin/creators/components/AdminCreatorsTableContainer.js";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import Page from "../../../../components/layouts/Page.js";
import AddCreatorFormAdmin from "../../../../features/dashboard/admin/creators/forms/AddCreatorFormAdmin.js";
import Sidebar from "../../../../components/app/Sidebar.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const searchQuery = c.req.query("search");
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;
  const creatorsPaginationBaseUrl = paginationRequestBaseUrl(c.req.url);
  return c.html(
    /* @__PURE__ */ jsx(AppLayout, { title: "New Creator", user, currentPath, children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs(Sidebar, { currentPath, children: [
      /* @__PURE__ */ jsx(AddCreatorFormAdmin, {}),
      /* @__PURE__ */ jsx(
        AdminCreatorsTableContainer,
        {
          searchQuery,
          currentPage,
          currentPath: creatorsPaginationBaseUrl
        }
      )
    ] }) }) })
  );
});
export {
  GET
};
