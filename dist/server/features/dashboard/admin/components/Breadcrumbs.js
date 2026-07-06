import { jsx, jsxs } from "hono/jsx/jsx-runtime";
const Breadcrumbs = ({ items }) => {
  return /* @__PURE__ */ jsx("nav", { class: "kicker text-on-surface", children: /* @__PURE__ */ jsx("ol", { class: "flex flex-wrap items-center gap-1", children: items.map((item, index) => {
    if (index >= items.length - 1) {
      return /* @__PURE__ */ jsx("li", { children: item.label });
    }
    return /* @__PURE__ */ jsxs("li", { class: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsx(
        "a",
        {
          href: item.href,
          class: "hover:text-on-surface-strong cursor-pointer",
          children: item.label
        }
      ),
      chevronRightIcon
    ] });
  }) }) });
};
var Breadcrumbs_default = Breadcrumbs;
const chevronRightIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
    "stroke-width": "2",
    stroke: "currentColor",
    class: "size-4",
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        d: "m8.25 4.5 7.5 7.5-7.5 7.5"
      }
    )
  }
);
export {
  Breadcrumbs_default as default
};
