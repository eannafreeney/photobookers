import { jsx, jsxs } from "hono/jsx/jsx-runtime";
const PageHeader = ({ title, kicker, intro }) => /* @__PURE__ */ jsxs("header", { class: "flex flex-col gap-2 border-b-2 border-on-surface-strong pb-6", children: [
  kicker ? /* @__PURE__ */ jsx("span", { class: "kicker text-accent", children: kicker }) : null,
  /* @__PURE__ */ jsx("h1", { class: "font-display text-4xl md:text-6xl font-medium leading-tight text-on-surface-strong text-balance", children: title }),
  intro ? /* @__PURE__ */ jsx("p", { class: "max-w-2xl text-sm md:text-base text-on-surface text-pretty", children: intro }) : null
] });
var PageHeader_default = PageHeader;
export {
  PageHeader_default as default
};
