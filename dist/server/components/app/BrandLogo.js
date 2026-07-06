import { jsx } from "hono/jsx/jsx-runtime";
const BrandLogo = () => /* @__PURE__ */ jsx(
  "a",
  {
    href: "/",
    class: "text-3xl font-semibold font-logo text-on-surface-strong outline-none focus:outline-none",
    children: /* @__PURE__ */ jsx("span", { children: "Photobookers" })
  }
);
var BrandLogo_default = BrandLogo;
export {
  BrandLogo_default as default
};
