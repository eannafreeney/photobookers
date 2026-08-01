import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import Page from "../../../../components/layouts/Page.js";
import Sidebar from "../../../../components/app/Sidebar.js";
import PageHeader from "../../../../components/app/PageHeader.js";
import { getFlash, getUser } from "../../../../utils.js";
import { listPublicListsForAdmin } from "../../../../domain/lists/services.js";
import InfoPage from "../../../../pages/InfoPage.js";
import AdminListsTable from "../../../../features/dashboard/admin/lists/AdminListsTable.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const searchQuery = c.req.query("search");
  const currentPage = Number(c.req.query("page") ?? 1);
  const [error, result] = await listPublicListsForAdmin(
    currentPage,
    searchQuery
  );
  if (error || !result) {
    return c.html(
      /* @__PURE__ */ jsx(InfoPage, { errorMessage: error?.reason ?? "Failed to load lists", user })
    );
  }
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Lists",
        user,
        flash,
        currentPath,
        children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs(Sidebar, { currentPath, children: [
          /* @__PURE__ */ jsx(
            PageHeader,
            {
              title: "Lists",
              intro: "Promote public collector lists to the homepage."
            }
          ),
          /* @__PURE__ */ jsxs("form", { method: "get", action: "/dashboard/admin/lists", class: "mb-4 flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "search",
                name: "search",
                value: searchQuery ?? "",
                placeholder: "Search by title",
                class: "rounded-radius border border-outline bg-surface px-3 py-2 text-sm"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                class: "rounded-radius border border-outline px-3 py-2 text-sm",
                children: "Search"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(AdminListsTable, { lists: result.lists })
        ] }) })
      }
    )
  );
});
export {
  GET
};
