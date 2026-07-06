import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import ToastContainer from "./ToastContainer.js";
import { alertVariants, toastIconSvgs } from "../../lib/toastVariants.js";
const Alert = ({ type, message }) => {
  return /* @__PURE__ */ jsx(ToastContainer, { children: /* @__PURE__ */ jsx(Toast, { type, message }) });
};
var Alert_default = Alert;
const Toast = ({ type, message }) => {
  const variant = alertVariants[type];
  const alpineAttrs = {
    "x-data": "alert",
    "x-show": "show",
    "x-transition.duration.500ms": ""
  };
  return /* @__PURE__ */ jsx(
    "li",
    {
      ...alpineAttrs,
      class: `overflow-hidden rounded-sm border
          bg-surface text-on-surface
          ${variant.border}
          `,
      children: /* @__PURE__ */ jsxs("div", { class: `flex w-full items-center gap-2 p-2 ${variant.bg}`, children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            class: `rounded-full p-1 ${variant.iconWrapper}`,
            dangerouslySetInnerHTML: { __html: toastIconSvgs[type] }
          }
        ),
        /* @__PURE__ */ jsx("p", { class: "text-xs font-medium sm:text-sm", children: message }),
        /* @__PURE__ */ jsx("button", { class: "ml-auto cursor-pointer", "x-on:click": "dismiss()", children: /* @__PURE__ */ jsx(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            "aria-hidden": "true",
            stroke: "currentColor",
            fill: "none",
            "stroke-width": "2.5",
            class: "size-4 shrink-0",
            children: /* @__PURE__ */ jsx(
              "path",
              {
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
                d: "M6 18L18 6M6 6l12 12"
              }
            )
          }
        ) })
      ] })
    }
  );
};
export {
  alertVariants,
  Alert_default as default
};
