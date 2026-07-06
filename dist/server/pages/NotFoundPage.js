import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../components/app/SectionTitle.js";
import AppLayout from "../components/layouts/AppLayout.js";
import Page from "../components/layouts/Page.js";
import Button from "../components/app/Button.js";
const NotFoundPage = ({
  currentPath,
  user
}) => {
  return /* @__PURE__ */ jsx(AppLayout, { title: "Page not found", currentPath, user, children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col items-center justify-center min-h-[50vh] text-center gap-6", children: [
    /* @__PURE__ */ jsx("p", { class: "kicker text-accent", children: "Out of Print" }),
    /* @__PURE__ */ jsx("p", { class: "font-display text-8xl md:text-9xl font-medium leading-none text-on-surface-strong", children: "404" }),
    /* @__PURE__ */ jsx(SectionTitle, { className: "mb-0", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { class: "text-on-surface max-w-md text-pretty", children: "The page you\u2019re looking for doesn\u2019t exist or has been moved." }),
    /* @__PURE__ */ jsx("a", { href: "/featured", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "lg", children: "Back home" }) })
  ] }) }) });
};
var NotFoundPage_default = NotFoundPage;
export {
  NotFoundPage_default as default
};
