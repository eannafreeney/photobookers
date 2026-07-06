import { jsx, jsxs } from "hono/jsx/jsx-runtime";
function MobileHeader({ kicker, title, children }) {
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-1 border-b-2 border-on-surface-strong pb-3", children: [
    /* @__PURE__ */ jsx("span", { class: "kicker text-accent", children: kicker }),
    /* @__PURE__ */ jsx("h1", { class: "font-display text-3xl font-medium leading-tight text-on-surface-strong text-balance pb-1", children: title }),
    children
  ] });
}
var MobileHeader_default = MobileHeader;
export {
  MobileHeader_default as default
};
