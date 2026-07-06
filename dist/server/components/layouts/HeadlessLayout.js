import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Head from "./Head.js";
import BrandLogo from "../app/BrandLogo.js";
import Alert from "../app/Alert.js";
import Footer from "../app/Footer.js";
import ToastContainer from "../app/ToastContainer.js";
import { isStaging } from "../../lib/isStaging.js";
const HeadlessLayout = ({
  title,
  description,
  children,
  flash,
  noIndex = true,
  showNavbar = true,
  showFooter = true
}) => /* @__PURE__ */ jsxs("html", { lang: "en", children: [
  /* @__PURE__ */ jsx(Head, { title, description, noIndex }),
  /* @__PURE__ */ jsxs("body", { class: "bg-surface", children: [
    flash && /* @__PURE__ */ jsx(Alert, { type: flash.type, message: flash.message }),
    /* @__PURE__ */ jsx(ToastContainer, {}),
    showNavbar && /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsx("main", { class: "container mx-auto min-h-screen px-4", children }),
    showFooter && /* @__PURE__ */ jsx(Footer, {})
  ] })
] });
var HeadlessLayout_default = HeadlessLayout;
const Navbar = () => {
  const staging = isStaging();
  return /* @__PURE__ */ jsx(
    "nav",
    {
      class: staging ? "flex items-center justify-between gap-4 border-b border-amber-300 bg-amber-50 px-6 py-4" : "flex items-center justify-between gap-4 border-b border-on-surface-strong bg-surface px-6 py-4",
      children: /* @__PURE__ */ jsx(BrandLogo, {})
    }
  );
};
export {
  HeadlessLayout_default as default
};
