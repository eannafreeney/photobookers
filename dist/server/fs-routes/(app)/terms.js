import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import AppLayout from "../../components/layouts/AppLayout.js";
import Page from "../../components/layouts/Page.js";
import { TERMS_SECTIONS } from "../../features/legal/termsContent.js";
import { canonicalUrl, pageTitle } from "../../lib/seo.js";
const GET = createRoute(async (c) => {
  const currentPath = c.req.path;
  const title = pageTitle("Terms and Conditions");
  const description = "Terms and conditions for using photobookers.";
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title,
        description,
        canonicalUrl: canonicalUrl(c.req.url, "/terms"),
        currentPath,
        children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs("div", { class: "container mx-auto max-w-2xl flex flex-col gap-4", children: [
          /* @__PURE__ */ jsxs("header", { class: "flex flex-col gap-2 border-b-2 border-on-surface-strong pb-6 mb-4", children: [
            /* @__PURE__ */ jsx("span", { class: "kicker text-accent", children: "The Small Print" }),
            /* @__PURE__ */ jsx("h1", { class: "font-display text-4xl md:text-5xl font-medium leading-tight text-on-surface-strong", children: "Terms and Conditions" })
          ] }),
          TERMS_SECTIONS.map((section) => /* @__PURE__ */ jsx("div", { children: section }))
        ] }) })
      }
    )
  );
});
export {
  GET
};
