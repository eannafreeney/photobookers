import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormPost from "../../../../../components/forms/FormPost.js";
const chevronUp = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "stroke-width": "2",
    stroke: "currentColor",
    class: "size-4",
    children: /* @__PURE__ */ jsx("path", { "stroke-linecap": "round", "stroke-linejoin": "round", d: "m4.5 15.75 7.5-7.5 7.5 7.5" })
  }
);
const chevronDown = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "stroke-width": "2",
    stroke: "currentColor",
    class: "size-4",
    children: /* @__PURE__ */ jsx("path", { "stroke-linecap": "round", "stroke-linejoin": "round", d: "m19.5 8.25-7.5 7.5-7.5-7.5" })
  }
);
const ReorderControls = ({ bookId, action, isFirst, isLast }) => {
  const alpineAttrs = { "x-target": "magazine-books toast" };
  const buttonClass = "text-on-surface-weak hover:text-on-surface-strong disabled:pointer-events-none disabled:opacity-30";
  return /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-1", children: [
    /* @__PURE__ */ jsxs(FormPost, { action: `${action}/move-book`, ...alpineAttrs, children: [
      /* @__PURE__ */ jsx("input", { type: "hidden", name: "bookId", value: bookId }),
      /* @__PURE__ */ jsx("input", { type: "hidden", name: "direction", value: "up" }),
      /* @__PURE__ */ jsx("button", { type: "submit", disabled: isFirst, class: buttonClass, title: "Move up", children: chevronUp })
    ] }),
    /* @__PURE__ */ jsxs(FormPost, { action: `${action}/move-book`, ...alpineAttrs, children: [
      /* @__PURE__ */ jsx("input", { type: "hidden", name: "bookId", value: bookId }),
      /* @__PURE__ */ jsx("input", { type: "hidden", name: "direction", value: "down" }),
      /* @__PURE__ */ jsx("button", { type: "submit", disabled: isLast, class: buttonClass, title: "Move down", children: chevronDown })
    ] })
  ] });
};
var ReorderControls_default = ReorderControls;
export {
  ReorderControls_default as default
};
