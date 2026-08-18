import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
import {
  analyticsIcon,
  bookIcon,
  booksIcon,
  fullHeartIcon,
  lightbulbIcon,
  libraryIcon,
  mailIcon,
  usersIcon
} from "../../../../lib/icons.js";
import { isFeatureEnabled } from "../../../../lib/features.js";
const NavTabs = ({
  currentPath,
  creatorId,
  showProfile = false
}) => {
  const showCollectorTabs = isFeatureEnabled("collectors");
  return /* @__PURE__ */ jsxs(
    "nav",
    {
      id: "nav-tabs",
      class: "flex flex-col md:flex-row flex-wrap items-center justify-center border-b border-outline gap-2 md:gap-4 mb-8 mt-4 bg-surface",
      children: [
        /* @__PURE__ */ jsxs(NavLink, { href: "/dashboard", currentPath, exact: true, children: [
          booksIcon,
          "Books"
        ] }),
        /* @__PURE__ */ jsxs(NavLink, { href: "/dashboard/analytics", currentPath, children: [
          analyticsIcon,
          "Analytics"
        ] }),
        /* @__PURE__ */ jsxs(NavLink, { href: "/dashboard/posts", currentPath, children: [
          mailIcon(5),
          "Posts"
        ] }),
        showCollectorTabs ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(NavLink, { href: "/dashboard/shelf", currentPath, children: [
            bookIcon,
            "Shelf"
          ] }),
          /* @__PURE__ */ jsxs(NavLink, { href: "/dashboard/favorites", currentPath, children: [
            fullHeartIcon(5),
            "Favorites"
          ] }),
          /* @__PURE__ */ jsxs(NavLink, { href: "/dashboard/lists", currentPath, children: [
            libraryIcon(5),
            "Lists"
          ] })
        ] }) : null,
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
        ) : null,
        /* @__PURE__ */ jsxs(NavLink, { href: "/dashboard/guide", currentPath, children: [
          lightbulbIcon(5),
          "Guide"
        ] })
      ]
    }
  );
};
const NavLink = ({ href, children, currentPath, exact = false }) => {
  const isActive = exact ? currentPath === href : Boolean(currentPath?.startsWith(href));
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
