import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
const SectionHeader = ({ kicker, children, action, className }) => /* @__PURE__ */ jsx(
  "div",
  {
    class: clsx("mb-6 border-t-2 border-on-surface-strong pt-3", className),
    children: /* @__PURE__ */ jsxs("div", { class: "flex items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { class: "flex min-w-0 flex-col gap-1", children: [
        kicker ? /* @__PURE__ */ jsx("span", { class: "kicker text-accent", children: kicker }) : null,
        children ? /* @__PURE__ */ jsx("h2", { class: "font-display text-2xl font-medium text-on-surface-strong", children }) : null
      ] }),
      action ?? null
    ] })
  }
);
var SectionHeader_default = SectionHeader;
export {
  SectionHeader_default as default
};
