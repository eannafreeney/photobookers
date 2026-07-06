import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
import { useUser } from "../../contexts/UserContext.js";
import Button from "../app/Button.js";
import NavAvatar from "../app/NavAvatar.js";
const NavDesktopMenu = ({ currentPath }) => {
  const user = useUser();
  return /* @__PURE__ */ jsxs("ul", { class: "hidden items-center gap-4 shrink-0 sm:flex", children: [
    !user && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(NavLink, { href: "/auth/login", currentPath, children: "Login" }),
      /* @__PURE__ */ jsx("a", { href: "/auth/accounts", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", children: /* @__PURE__ */ jsx("span", { children: "Register" }) }) })
    ] }),
    user && /* @__PURE__ */ jsxs(
      "li",
      {
        "x-data": "{ userDropDownIsOpen: false }",
        class: "relative flex items-center",
        children: [
          /* @__PURE__ */ jsx(
            NavAvatar,
            {
              creator: user.creator ?? void 0,
              user,
              currentPath
            }
          ),
          /* @__PURE__ */ jsx(DropDownMenu, { currentPath, user })
        ]
      }
    )
  ] });
};
var NavDesktopMenu_default = NavDesktopMenu;
const NavLink = ({
  href,
  children,
  currentPath,
  xTarget,
  variant = "menu",
  ...props
}) => {
  const isActive = currentPath === href;
  if (variant === "nav") {
    return /* @__PURE__ */ jsx("li", { class: "list-none", children: /* @__PURE__ */ jsx(
      "a",
      {
        href,
        class: clsx(
          "block px-1 py-2 kicker transition-colors border-b-2",
          isActive ? "text-on-surface-strong border-accent" : "text-on-surface border-transparent hover:text-on-surface-strong hover:border-outline"
        ),
        "x-target": xTarget,
        ...props,
        children
      }
    ) });
  }
  return /* @__PURE__ */ jsx("li", { class: "list-none", children: /* @__PURE__ */ jsx(
    "a",
    {
      href,
      class: clsx(
        "block bg-surface px-4 py-2 text-sm hover:bg-surface-alt hover:text-on-surface-strong focus-visible:bg-surface-alt focus-visible:text-on-surface-strong focus-visible:outline-hidden",
        isActive ? "text-accent" : "text-on-surface"
      ),
      "x-target": xTarget,
      ...props,
      children
    }
  ) });
};
const DropDownMenu = ({
  currentPath,
  user
}) => {
  const alpineAttrs = {
    "x-cloak": "",
    "x-show": "userDropDownIsOpen",
    "x-transition.opacity": "",
    "x-on:click.outside": "userDropDownIsOpen = false"
  };
  return /* @__PURE__ */ jsxs(
    "ul",
    {
      id: "userMenu",
      class: "absolute z-20 right-0 top-12 flex w-fit min-w-48 flex-col overflow-hidden border border-outline bg-surface shadow-lg py-1.5",
      ...alpineAttrs,
      children: [
        /* @__PURE__ */ jsx("li", { class: "border-b border-outline dark:border-outline-dark", children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col px-4 py-2", children: [
          /* @__PURE__ */ jsx("span", { class: "text-sm font-medium text-on-surface-strong dark:text-on-surface-dark-strong", children: user?.firstName && user?.lastName ? `${user?.firstName} ${user?.lastName}` : `${user.creator?.displayName}` }),
          /* @__PURE__ */ jsx("p", { class: "text-xs text-on-surface dark:text-on-surface-dark", children: user?.email })
        ] }) }),
        user?.id && !user.creator && /* @__PURE__ */ jsx(NavLink, { href: `/users/${user?.id}/update`, xTarget: "modal-root", children: "Edit Profile" }),
        user.creator?.id && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(NavLink, { href: "/dashboard", currentPath, children: "Dashboard" }),
          /* @__PURE__ */ jsx(
            NavLink,
            {
              href: `/creators/${user?.creator?.slug}`,
              currentPath,
              children: `View ${user?.creator?.displayName}`
            }
          )
        ] }),
        user?.isAdmin && /* @__PURE__ */ jsx(
          NavLink,
          {
            href: "/dashboard/admin/notifications",
            currentPath,
            children: "Admin Dashboard"
          }
        ),
        user && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(NavLink, { href: "/followed-creators", currentPath, children: "Creators I Follow" }),
          /* @__PURE__ */ jsx(
            NavLink,
            {
              href: "/auth/reset-password",
              currentPath,
              ...{ "x-target": "modal-root" },
              children: "Reset Password"
            }
          ),
          /* @__PURE__ */ jsx(
            "form",
            {
              ...{ "x-target.away": "_top", "x-target": "toast" },
              action: "/auth/logout",
              method: "post",
              children: /* @__PURE__ */ jsx(
                "button",
                {
                  class: "block bg-surface px-4 py-2 text-sm text-on-surface hover:bg-surface-alt hover:text-on-surface-strong focus-visible:bg-surface-alt focus-visible:text-on-surface-strong focus-visible:outline-hidden cursor-pointer w-full text-left",
                  type: "submit",
                  children: "Logout"
                }
              )
            }
          )
        ] })
      ]
    }
  );
};
export {
  NavLink,
  NavDesktopMenu_default as default
};
