import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
import Page from "../../../components/layouts/Page.js";
import {
  bookIcon,
  fullHeartIcon,
  lightbulbIcon,
  libraryIcon,
  mailIcon
} from "../../../lib/icons.js";
const CollectorDashboardShell = ({ children, currentPath }) => {
  return /* @__PURE__ */ jsxs(Page, { children: [
    /* @__PURE__ */ jsxs(
      "nav",
      {
        id: "nav-tabs",
        class: "flex flex-col md:flex-row flex-wrap items-center justify-center border-b border-outline gap-2 md:gap-4 mb-8 mt-4 bg-surface",
        children: [
          /* @__PURE__ */ jsxs(NavLink, { href: "/dashboard/shelf", currentPath, children: [
            bookIcon,
            "Shelf"
          ] }),
          /* @__PURE__ */ jsxs(NavLink, { href: "/dashboard/favorites", currentPath, children: [
            fullHeartIcon(5),
            "Favorites"
          ] }),
          /* @__PURE__ */ jsxs(NavLink, { href: "/dashboard/posts", currentPath, children: [
            mailIcon(5),
            "Posts"
          ] }),
          /* @__PURE__ */ jsxs(NavLink, { href: "/dashboard/lists", currentPath, children: [
            libraryIcon(5),
            "Lists"
          ] }),
          /* @__PURE__ */ jsxs(NavLink, { href: "/dashboard/guide", currentPath, children: [
            lightbulbIcon(5),
            "Guide"
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        id: "collector-dashboard-panel",
        class: "flex flex-col gap-8",
        "x-merge": "replace",
        children
      }
    )
  ] });
};
const NavLink = ({ href, children, currentPath }) => {
  const isActive = Boolean(currentPath?.startsWith(href));
  return /* @__PURE__ */ jsx("li", { class: "list-none", children: /* @__PURE__ */ jsx(
    "a",
    {
      href,
      ...isActive ? { "aria-current": "page", "x-on:click.prevent": "" } : { "x-target": "collector-dashboard-panel nav-tabs" },
      prefetch: "intent",
      class: clsx(
        "flex items-center gap-2 border-b-2 border-transparent md:-mb-px px-4 py-2 kicker transition-colors",
        isActive ? "text-on-surface-strong border-b-accent" : "text-on-surface-weak hover:text-on-surface-strong"
      ),
      children
    }
  ) });
};
var CollectorDashboardShell_default = CollectorDashboardShell;
export {
  CollectorDashboardShell_default as default
};
