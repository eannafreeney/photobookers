import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import NavDesktopMenu, { NavLink } from "./NavDesktopMenu.js";
import NavMobileMenu from "./NavMobileMenu.js";
import NavSearch from "./NavSearch.js";
import BrandLogo from "../app/BrandLogo.js";
import Button from "../app/Button.js";
import { isStaging } from "../../lib/isStaging.js";
const Navbar = ({ currentPath, user, adminEditHref }) => {
  const staging = isStaging();
  const alpineAttrs = {
    "x-data": "{ mobileMenuIsOpen: false, scrolled: false }",
    "x-init": "scrolled = window.scrollY > 20",
    "x-on:click.away": "mobileMenuIsOpen = false",
    "x-on:scroll.window": "scrolled = window.scrollY > 20"
  };
  return /* @__PURE__ */ jsx(
    "nav",
    {
      "x-bind:class": "scrolled ? 'py-2! shadow-sm' : ''",
      class: `sticky top-0 z-50 border-b py-4 shadow-none transition-all duration-200 ease-in-out ${staging ? "border-blue-300 bg-blue-500" : "border-on-surface-strong bg-surface"}`,
      ...alpineAttrs,
      children: /* @__PURE__ */ jsxs("div", { class: "mx-auto flex w-full max-w-[1680px] items-center justify-between gap-4 px-4 md:px-8", children: [
        /* @__PURE__ */ jsx(BrandLogo, {}),
        /* @__PURE__ */ jsxs("div", { class: "hidden md:flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(AdminEditButton, { href: adminEditHref, user }),
          /* @__PURE__ */ jsx(NavLink, { href: "/books", currentPath, variant: "nav", children: "Books" }),
          /* @__PURE__ */ jsx(NavLink, { href: "/creators", currentPath, variant: "nav", children: "Creators" }),
          user && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(NavLink, { href: "/feed", currentPath, variant: "nav", children: "Feed" }),
            /* @__PURE__ */ jsx(NavLink, { href: "/library", currentPath, variant: "nav", children: "Library" }),
            /* @__PURE__ */ jsx(NavLink, { href: "/messages", currentPath, variant: "nav", children: "Messages" })
          ] }),
          !user && /* @__PURE__ */ jsx(NavLink, { href: "/about", currentPath, variant: "nav", children: "About" }),
          /* @__PURE__ */ jsx(NavSearch, {}),
          /* @__PURE__ */ jsx(NavDesktopMenu, { currentPath })
        ] }),
        /* @__PURE__ */ jsx(NavMobileMenu, { currentPath })
      ] })
    }
  );
};
var Navbar_default = Navbar;
const AdminEditButton = ({ href, user }) => {
  if (!user?.isAdmin || !href) return /* @__PURE__ */ jsx(Fragment, { children: " " });
  return /* @__PURE__ */ jsx("a", { href, children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "secondary", width: "sm", children: "Edit" }) });
};
export {
  Navbar_default as default
};
