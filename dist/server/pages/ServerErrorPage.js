import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../components/app/SectionTitle.js";
import AppLayout from "../components/layouts/AppLayout.js";
import Page from "../components/layouts/Page.js";
import Button from "../components/app/Button.js";
const ServerErrorPage = ({ currentPath, user }) => {
  return /* @__PURE__ */ jsx(AppLayout, { title: "Under maintenance", currentPath, user, children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col items-center justify-center min-h-[50vh] text-center gap-6", children: [
    /* @__PURE__ */ jsx("p", { class: "kicker text-accent", children: "Opps, something went wrong" }),
    /* @__PURE__ */ jsx(SectionTitle, { className: "mb-0", children: "Currently under maintenance" }),
    /* @__PURE__ */ jsx("p", { class: "text-on-surface max-w-md text-pretty", children: "Something went wrong on our side. We're working on it \u2014 please try again in a few minutes." }),
    /* @__PURE__ */ jsx("a", { href: "/featured", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "lg", children: "Back home" }) })
  ] }) }) });
};
var ServerErrorPage_default = ServerErrorPage;
export {
  ServerErrorPage_default as default
};
