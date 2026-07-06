import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
const SectionTitle = ({
  children,
  className = "mb-2",
  kicker
}) => {
  const headingClass = "flex items-center gap-2 font-display text-2xl font-medium text-on-surface-strong";
  if (!kicker) {
    return /* @__PURE__ */ jsx("h2", { class: clsx(headingClass, className), children });
  }
  return /* @__PURE__ */ jsxs("div", { class: clsx("flex flex-col gap-1 mt-4", className), children: [
    /* @__PURE__ */ jsx("span", { class: "kicker text-accent", children: kicker }),
    /* @__PURE__ */ jsx("h2", { class: headingClass, children })
  ] });
};
var SectionTitle_default = SectionTitle;
export {
  SectionTitle_default as default
};
