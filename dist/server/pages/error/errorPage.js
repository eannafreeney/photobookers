import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../components/app/Button.js";
import AppLayout from "../../components/layouts/AppLayout.js";
import Page from "../../components/layouts/Page.js";
const ErrorPage = ({ errorMessage, user }) => /* @__PURE__ */ jsx(AppLayout, { title: "Error", user, currentPath: "/", children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4 items-center justify-center min-h-screen", children: [
  /* @__PURE__ */ jsx("div", { class: "text-center text-2xl font-medium max-w-4xl", children: errorMessage }),
  /* @__PURE__ */ jsx("a", { href: "/", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", children: "Go Home" }) })
] }) }) });
var errorPage_default = ErrorPage;
export {
  errorPage_default as default
};
