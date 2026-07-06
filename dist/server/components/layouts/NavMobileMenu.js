import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
import { useUser } from "../../contexts/UserContext.js";
import { fadeTransition } from "../../lib/transitions.js";
import NavSearchMobile from "./NavSearchMobile.js";
import { getInitialsAvatar } from "../../lib/avatar.js";
import Button from "../app/Button.js";
import { closeMobileMenuIcon, openMobileMenuIcon } from "../../lib/icons.js";
const NavMobileMenu = ({ currentPath }) => {
  return /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-5 md:hidden", children: [
    /* @__PURE__ */ jsx(NavSearchMobile, {}),
    /* @__PURE__ */ jsx(MobileMenuButton, {}),
    /* @__PURE__ */ jsx(MobileDropDownMenu, { currentPath })
  ] });
};
var NavMobileMenu_default = NavMobileMenu;
const MobileMenuButton = () => {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      "x-on:click": "mobileMenuIsOpen = !mobileMenuIsOpen",
      "x-bind:class": "mobileMenuIsOpen ? 'fixed top-6 right-6 z-20' : null",
      type: "button",
      class: "flex text-on-surface sm:hidden",
      children: [
        openMobileMenuIcon,
        closeMobileMenuIcon
      ]
    }
  );
};
const NavLink = ({ href, children, currentPath }) => {
  const isActive = currentPath === href;
  return /* @__PURE__ */ jsx("li", { class: "border-b border-outline", children: /* @__PURE__ */ jsx(
    "a",
    {
      href,
      class: clsx(
        "block w-full py-3 font-display text-2xl focus:underline",
        isActive ? "text-accent" : "text-on-surface-strong"
      ),
      children
    }
  ) });
};
const MobileDropDownMenu = ({
  currentPath
}) => {
  const user = useUser();
  const avatarUrl = user?.creator?.coverUrl ?? getInitialsAvatar(user?.firstName ?? "", user?.lastName ?? "");
  const avatarAlt = `${user?.firstName} ${user?.lastName}`;
  return /* @__PURE__ */ jsxs(
    "ul",
    {
      "x-cloak": true,
      "x-show": "mobileMenuIsOpen",
      ...fadeTransition,
      class: "fixed h-svh overflow-y-auto inset-0 z-20 flex flex-col bg-surface px-8 pb-24 pt-10 sm:hidden",
      children: [
        /* @__PURE__ */ jsx("li", { class: "mb-4 border-none", children: /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2 py-2", children: [
          user && /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2 py-2", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: avatarUrl,
                alt: avatarAlt,
                loading: "lazy",
                class: "size-12 rounded-full object-cover"
              }
            ),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("span", { class: "font-medium text-on-surface-strong dark:text-on-surface-dark-strong", children: [
                user?.firstName,
                " ",
                user?.lastName
              ] }),
              /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface dark:text-on-surface-dark", children: user?.email })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              "x-on:click": "mobileMenuIsOpen = !mobileMenuIsOpen",
              "x-bind:class": "mobileMenuIsOpen ? 'fixed top-6 right-6 z-20' : null",
              type: "button",
              class: "flex text-on-surface sm:hidden",
              children: closeMobileMenuIcon
            }
          )
        ] }) }),
        !user && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(NavLink, { href: "/auth/login", currentPath, children: "Login" }),
          /* @__PURE__ */ jsx(NavLink, { href: "/auth/accounts", currentPath, children: "Register" })
        ] }),
        user?.creator?.id && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(NavLink, { href: "/dashboard", currentPath, children: "Dashboard" }),
          /* @__PURE__ */ jsx(
            NavLink,
            {
              href: `/creators/${user?.creator?.slug}`,
              currentPath,
              children: "View Profile"
            }
          ),
          /* @__PURE__ */ jsx(
            NavLink,
            {
              href: `/dashboard/creators/${user?.creator?.id}`,
              currentPath,
              children: `Edit ${user.creator.type === "artist" ? "Artist" : "Publisher"} Profile`
            }
          )
        ] }),
        user?.isAdmin && /* @__PURE__ */ jsx(NavLink, { href: "/dashboard/admin/planner", currentPath, children: "Admin Dashboard" }),
        /* @__PURE__ */ jsx(NavLink, { href: "/creators", currentPath, children: "Creators" }),
        /* @__PURE__ */ jsx(NavLink, { href: "/about", currentPath, children: "About" }),
        /* @__PURE__ */ jsx(NavLink, { href: "/contact", currentPath, children: "Contact" }),
        user && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(NavLink, { href: "/followed-creators", currentPath, children: "Creators I Follow" }),
          /* @__PURE__ */ jsx(
            "form",
            {
              ...{ "x-target.away": "_top", "x-target": "toast" },
              action: "/auth/logout",
              method: "post",
              children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", type: "submit", children: /* @__PURE__ */ jsx("span", { children: "Logout" }) })
            }
          )
        ] })
      ]
    }
  );
};
export {
  NavMobileMenu_default as default
};
