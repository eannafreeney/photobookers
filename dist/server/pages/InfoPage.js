import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../components/app/Button.js";
import AppLayout from "../components/layouts/AppLayout.js";
import Page from "../components/layouts/Page.js";
import { thumbsDownIcon, thumbsUpIcon } from "../lib/icons.js";
const InfoPage = ({
  errorMessage,
  user,
  isSuccess,
  redirectUrl = "/",
  redirectText = "Go Home"
}) => /* @__PURE__ */ jsx(AppLayout, { title: "Error", user, currentPath: "/", children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-6 items-center justify-center min-h-screen", children: [
  /* @__PURE__ */ jsx("div", { children: isSuccess ? thumbsUpIcon() : thumbsDownIcon() }),
  /* @__PURE__ */ jsx("div", { class: "text-center text-2xl font-medium max-w-4xl", children: errorMessage }),
  /* @__PURE__ */ jsx("a", { href: redirectUrl, children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "lg", children: redirectText }) })
] }) }) });
var InfoPage_default = InfoPage;
export {
  InfoPage_default as default
};
