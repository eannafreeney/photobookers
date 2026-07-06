import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
import {
  analyticsIcon,
  booksIcon,
  mailIcon,
  usersIcon
} from "../../../../lib/icons.js";
const NavTabs = ({
  currentPath,
  creatorId,
  showProfile = false
}) => {
  return /* @__PURE__ */ jsxs(
    "nav",
    {
      id: "nav-tabs",
      class: "flex flex-col md:flex-row items-center justify-center border-b border-outline gap-4 mb-8 mt-4 bg-surface",
      children: [
        /* @__PURE__ */ jsxs(NavLink, { href: "/dashboard", currentPath, children: [
          booksIcon,
          "Books"
        ] }),
        /* @__PURE__ */ jsxs(NavLink, { href: "/dashboard/analytics", currentPath, children: [
          analyticsIcon,
          "Analytics"
        ] }),
        /* @__PURE__ */ jsxs(NavLink, { href: "/dashboard/messages", currentPath, children: [
          mailIcon(5),
          "Posts"
        ] }),
        showProfile ? /* @__PURE__ */ jsxs(
          NavLink,
          {
            href: `/dashboard/creators/${creatorId}`,
            currentPath,
            children: [
              usersIcon(5),
              "Profile"
            ]
          }
        ) : null
      ]
    }
  );
};
const NavLink = ({ href, children, currentPath }) => {
  const isActive = currentPath === href;
  return /* @__PURE__ */ jsx("li", { class: "list-none", children: /* @__PURE__ */ jsx(
    "a",
    {
      href,
      ...isActive ? { "aria-current": "page", "x-on:click.prevent": "" } : {
        "x-target": "creator-dashboard-panel nav-tabs"
      },
      prefetch: "intent",
      class: clsx(
        "flex items-center gap-2 border-b-2 border-transparent md:-mb-px px-4 py-2 kicker transition-colors",
        isActive ? "text-on-surface-strong border-b-accent" : "text-on-surface-weak hover:text-on-surface-strong"
      ),
      children
    }
  ) });
};
var NavTabs_default = NavTabs;
export {
  NavTabs_default as default
};
