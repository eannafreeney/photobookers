import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils.js";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import Page from "../../../../components/layouts/Page.js";
import CreateUserFormAdmin from "../../../../features/dashboard/admin/users/forms/CreateUserFormAdmin.js";
import UsersTableAdmin from "../../../../features/dashboard/admin/users/components/UsersTableAdmin.js";
import Sidebar from "../../../../components/app/Sidebar.js";
import { paginationRequestBaseUrl } from "../../../../lib/pagination.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const searchQuery = c.req.query("search");
  const currentPage = Number(c.req.query("page") ?? 1);
  const usersPaginationBaseUrl = paginationRequestBaseUrl(c.req.url);
  const currentPath = c.req.path;
  return c.html(
    /* @__PURE__ */ jsx(AppLayout, { title: "Users", user, currentPath, children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(Sidebar, { currentPath, children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
      /* @__PURE__ */ jsx(CreateUserFormAdmin, {}),
      /* @__PURE__ */ jsx(
        UsersTableAdmin,
        {
          currentPage,
          searchQuery,
          currentPath: usersPaginationBaseUrl
        }
      )
    ] }) }) }) })
  );
});
export {
  GET
};
