import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
import { bookIcon, feedIcon, libraryIcon, updatesIcon } from "../../lib/icons.js";
import FeatureGuard from "./FeatureGuard.js";
const NavTabs = ({ currentPath }) => {
  return /* @__PURE__ */ jsxs(
    "nav",
    {
      id: "nav-tabs",
      class: "hidden md:flex items-center justify-center border-b border-outline gap-4 mb-2 mt-2",
      children: [
        /* @__PURE__ */ jsxs(NavLink, { href: "/featured", currentPath, children: [
          bookIcon,
          "Featured"
        ] }),
        /* @__PURE__ */ jsxs(NavLink, { href: "/feed", currentPath, children: [
          feedIcon,
          "Feed"
        ] }),
        /* @__PURE__ */ jsxs(NavLink, { href: "/library", currentPath, children: [
          libraryIcon(5),
          "Library"
        ] }),
        /* @__PURE__ */ jsx(FeatureGuard, { flagName: "messages", children: /* @__PURE__ */ jsxs(NavLink, { href: "/messages", currentPath, children: [
          updatesIcon,
          "Updates"
        ] }) })
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
      prefetch: "intent",
      class: clsx(
        "flex items-center gap-2 border-b-2 border-transparent -mb-px px-4 py-2 kicker transition-colors",
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
