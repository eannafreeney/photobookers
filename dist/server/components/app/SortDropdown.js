import { jsx, jsxs } from "hono/jsx/jsx-runtime";
const SORT_LABELS = {
  newest: "Newest",
  oldest: "Oldest",
  title_asc: "Title (A\u2013Z)",
  title_desc: "Title (Z\u2013A)"
};
const SortDropdown = ({ sortBy, currentPath }) => {
  const sortLabel = SORT_LABELS[sortBy];
  const linkClass = "bg-surface-alt px-4 py-2 text-sm text-on-surface hover:bg-surface-dark-alt/5 hover:text-on-surface-strong focus-visible:bg-surface-dark-alt/10 focus-visible:text-on-surface-strong focus-visible:outline-hidden";
  const sortParam = (value) => `${currentPath}${currentPath.includes("?") ? "&" : "?"}sortBy=${value}`;
  const parentAttrs = {
    "x-data": "{ isOpen: false }",
    "x-on:keydown.esc.prevent": "isOpen = false",
    "x-on:click.outside": "isOpen = false"
  };
  const buttonAttrs = {
    "x-on:click": "isOpen = true",
    "x-bind:class": "isOpen  ? 'text-on-surface-strong dark:text-on-surface-dark-strong' : 'text-on-surface dark:text-on-surface-dark'",
    "x-bind:aria-expanded": "isOpen "
  };
  const dropdownAttrs = {
    "x-cloak": "",
    "x-show": "isOpen",
    "x-transition": "",
    "x-on:click.outside": "isOpen = false"
  };
  return /* @__PURE__ */ jsxs("div", { ...parentAttrs, class: "relative w-fit ", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        ...buttonAttrs,
        class: "inline-flex items-center gap-2 whitespace-nowrap rounded-radius border border-outline bg-surface-alt px-4 py-2 text-sm font-medium tracking-wide transition hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline-strong",
        "aria-haspopup": "true",
        children: [
          sortLabel,
          sortIcon
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "div",
      {
        ...dropdownAttrs,
        class: "absolute top-11 right-0 flex min-w-40 max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-radius border border-outline bg-surface-alt py-1.5",
        children: [
          /* @__PURE__ */ jsx("a", { href: currentPath, class: linkClass, role: "menuitem", children: "Newest" }),
          /* @__PURE__ */ jsx("a", { href: sortParam("oldest"), class: linkClass, role: "menuitem", children: "Oldest" }),
          /* @__PURE__ */ jsx("a", { href: sortParam("title_asc"), class: linkClass, role: "menuitem", children: "Title (A\u2013Z)" }),
          /* @__PURE__ */ jsx("a", { href: sortParam("title_desc"), class: linkClass, role: "menuitem", children: "Title (Z\u2013A)" })
        ]
      }
    )
  ] });
};
var SortDropdown_default = SortDropdown;
const sortIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    "aria-hidden": "true",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    "stroke-width": "2",
    stroke: "currentColor",
    class: "h-4 w-4 rotate-0",
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        d: "M19.5 8.25l-7.5 7.5-7.5-7.5"
      }
    )
  }
);
export {
  SortDropdown_default as default
};
