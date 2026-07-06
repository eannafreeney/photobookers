import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
import {
  analyticsIcon,
  bellIcon,
  booksIcon,
  claimsIcon,
  creatorsIcon,
  plannerIcon,
  usersIcon
} from "../../../../lib/icons.js";
import AdminBadge from "./AdminBadge.js";
const AdminNavTabs = ({ currentPath }) => {
  return /* @__PURE__ */ jsxs("nav", { id: "nav-tabs", class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxs(NavLink, { href: "/dashboard/admin/notifications", currentPath, children: [
      bellIcon(4),
      "Notifications",
      /* @__PURE__ */ jsx(AdminBadge, { xData: "adminNotificationsBadge" })
    ] }),
    /* @__PURE__ */ jsxs(NavLink, { href: "/dashboard/admin/planner", currentPath, children: [
      plannerIcon,
      "Planner"
    ] }),
    /* @__PURE__ */ jsxs(NavLink, { href: "/dashboard/admin/analytics", currentPath, children: [
      analyticsIcon,
      "Analytics"
    ] }),
    /* @__PURE__ */ jsxs(NavLink, { href: "/dashboard/admin/books", currentPath, children: [
      booksIcon,
      "Books"
    ] }),
    /* @__PURE__ */ jsxs(NavLink, { href: "/dashboard/admin/creators", currentPath, children: [
      creatorsIcon,
      "Creators"
    ] }),
    /* @__PURE__ */ jsxs(NavLink, { href: "/dashboard/admin/fairs", currentPath, children: [
      plannerIcon,
      "Fairs"
    ] }),
    /* @__PURE__ */ jsxs(NavLink, { href: "/dashboard/admin/stores", currentPath, children: [
      plannerIcon,
      "Stores"
    ] }),
    /* @__PURE__ */ jsxs(NavLink, { href: "/dashboard/admin/users", currentPath, children: [
      usersIcon(5),
      "Users"
    ] }),
    /* @__PURE__ */ jsxs(NavLink, { href: "/dashboard/admin/claims", currentPath, children: [
      claimsIcon,
      "Claims",
      /* @__PURE__ */ jsx(AdminBadge, { xData: "adminClaimsBadge" })
    ] }),
    /* @__PURE__ */ jsxs(NavLink, { href: "/dashboard/admin/interviews", currentPath, children: [
      usersIcon(5),
      "Interviews"
    ] })
  ] });
};
const NavLink = ({ href, children, currentPath }) => {
  const isActive = currentPath === href;
  return /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
    "a",
    {
      href,
      prefetch: "intent",
      class: clsx(
        "flex items-center gap-2 border-l-2 pl-2 -ml-2 py-0.5 transition-colors",
        isActive ? "font-semibold text-on-surface-strong border-accent" : "text-on-surface font-medium border-transparent hover:text-on-surface-strong hover:border-outline"
      ),
      children
    }
  ) });
};
var AdminNavTabs_default = AdminNavTabs;
export {
  AdminNavTabs_default as default
};
