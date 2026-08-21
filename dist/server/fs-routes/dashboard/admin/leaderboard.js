import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../utils.js";
import AppLayout from "../../../components/layouts/AppLayout.js";
import Page from "../../../components/layouts/Page.js";
import Sidebar from "../../../components/app/Sidebar.js";
import PageHeader from "../../../components/app/PageHeader.js";
import {
  getContributorLeaderboard
} from "../../../domain/contributors/services.js";
function displayName(entry) {
  return [entry.firstName, entry.lastName].filter(Boolean).join(" ") || "Anonymous";
}
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const leaderboard = await getContributorLeaderboard();
  return c.html(
    /* @__PURE__ */ jsx(AppLayout, { title: "Contributor Leaderboard", user, currentPath, children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs(Sidebar, { currentPath, children: [
      /* @__PURE__ */ jsx(PageHeader, { title: "Contributor Leaderboard" }),
      leaderboard.length > 0 ? /* @__PURE__ */ jsxs("table", { class: "w-full text-left text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { class: "border-b border-outline text-on-surface-weak", children: [
          /* @__PURE__ */ jsx("th", { class: "py-2 pr-4 w-8", children: "#" }),
          /* @__PURE__ */ jsx("th", { class: "py-2 pr-4", children: "Name" }),
          /* @__PURE__ */ jsx("th", { class: "py-2 pr-4 text-right", children: "Books" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: leaderboard.map((entry, i) => /* @__PURE__ */ jsxs("tr", { class: "border-b border-outline", children: [
          /* @__PURE__ */ jsx("td", { class: "py-2 pr-4 text-on-surface-weak", children: i + 1 }),
          /* @__PURE__ */ jsx("td", { class: "py-2 pr-4", children: /* @__PURE__ */ jsx(
            "a",
            {
              href: `/dashboard/admin/users/${entry.id}`,
              class: "font-medium text-on-surface-strong hover:underline",
              children: displayName(entry)
            }
          ) }),
          /* @__PURE__ */ jsx("td", { class: "py-2 pr-4 text-right", children: entry.bookCount })
        ] })) })
      ] }) : /* @__PURE__ */ jsx("p", { class: "text-on-surface-weak mt-4", children: "No contributors yet." })
    ] }) }) })
  );
});
export {
  GET
};
