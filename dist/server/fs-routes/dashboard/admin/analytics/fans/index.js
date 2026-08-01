import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import AppLayout from "../../../../../components/layouts/AppLayout.js";
import Page from "../../../../../components/layouts/Page.js";
import Sidebar from "../../../../../components/app/Sidebar.js";
import Link from "../../../../../components/app/Link.js";
import { getUser } from "../../../../../utils.js";
import { paginationRequestBaseUrl } from "../../../../../lib/pagination.js";
import FansTable from "../../../../../features/dashboard/admin/analytics/components/FansTable.js";
import { adminAnalyticsHref } from "../../../../../features/dashboard/admin/analytics/adminAnalyticsPanel.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;
  const paginationBaseUrl = paginationRequestBaseUrl(c.req.url);
  return c.html(
    /* @__PURE__ */ jsx(AppLayout, { title: "Fans", user, currentPath, children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(Sidebar, { currentPath, children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-6", children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          href: adminAnalyticsHref(null, { tab: "books" }),
          className: "text-sm text-on-surface hover:text-on-surface-strong",
          children: "\u2190 Back to book analytics"
        }
      ),
      /* @__PURE__ */ jsx(FansTable, { currentPage, currentPath: paginationBaseUrl })
    ] }) }) }) })
  );
});
export {
  GET
};
