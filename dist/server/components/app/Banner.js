import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import PageBleed from "../layouts/PageBleed.js";
const Banner = ({
  type = "default",
  message,
  children
}) => {
  const variantBg = {
    default: "bg-surface-alt/10",
    inverse: "bg-surface-dark-alt/10",
    primary: "bg-primary/10",
    secondary: "bg-secondary/10",
    info: "bg-info/10",
    success: "bg-success/10",
    warning: "bg-warning/10",
    danger: "bg-danger/10"
  };
  return /* @__PURE__ */ jsx(PageBleed, { children: /* @__PURE__ */ jsxs(
    "div",
    {
      class: `rounded-radius ${variantBg[type]} text-on-surface py-2 px-16 flex items-center justify-center gap-4`,
      children: [
        /* @__PURE__ */ jsx("p", { class: "text-center text-sm text-pretty", children: message }),
        /* @__PURE__ */ jsx("div", { children })
      ]
    }
  ) });
};
var Banner_default = Banner;
export {
  Banner_default as default
};
