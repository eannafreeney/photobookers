import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { alertVariants, toastIconSvgs } from "../../lib/toastVariants.js";
const AlertStatic = ({ type, message }) => {
  const variant = alertVariants[type];
  return /* @__PURE__ */ jsx(
    "div",
    {
      id: "toast",
      class: `fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-md z-50 overflow-hidden rounded-sm border
            bg-surface text-on-surface
            ${variant.border}`,
      children: /* @__PURE__ */ jsxs("div", { class: `flex w-full items-center gap-2 p-4 ${variant.bg}`, children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            "aria-hidden": "true",
            class: `rounded-full p-1 ${variant.iconWrapper}`,
            dangerouslySetInnerHTML: { __html: toastIconSvgs[type] }
          }
        ),
        /* @__PURE__ */ jsxs("div", { class: "ml-2", children: [
          /* @__PURE__ */ jsx("h3", { class: `text-sm font-semibold ${variant.class}`, children: variant.title }),
          /* @__PURE__ */ jsx("p", { class: "text-xs font-medium sm:text-sm", children: message })
        ] })
      ] })
    }
  );
};
var AlertStatic_default = AlertStatic;
export {
  AlertStatic_default as default
};
