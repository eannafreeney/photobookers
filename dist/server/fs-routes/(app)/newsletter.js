import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import PageHeader from "../../components/app/PageHeader.js";
import Page from "../../components/layouts/Page.js";
import NewsletterForm from "../../features/app/components/NewsletterForm.js";
import { pageTitle } from "../../lib/seo.js";
import { NEWSLETTER_COPY } from "../../constants/newsletter.js";
import HeadlessLayout from "../../components/layouts/HeadlessLayout.js";
import { POST } from "../api/newsletter.js";
const GET = createRoute(async (c) => {
  const title = pageTitle("Newsletter");
  const description = "Get a daily Book of the Day pick and weekly photobook highlights from Photobookers.";
  return c.html(
    /* @__PURE__ */ jsx(HeadlessLayout, { title, description, children: /* @__PURE__ */ jsxs(Page, { children: [
      /* @__PURE__ */ jsx(
        PageHeader,
        {
          kicker: NEWSLETTER_COPY.kicker,
          title: NEWSLETTER_COPY.title,
          intro: NEWSLETTER_COPY.banner
        }
      ),
      /* @__PURE__ */ jsxs("div", { class: "mx-auto w-full max-w-md flex flex-col gap-8", children: [
        /* @__PURE__ */ jsx("ul", { class: "list-disc list-inside space-y-2 text-sm text-on-surface", children: NEWSLETTER_COPY.bullets.map((bullet) => /* @__PURE__ */ jsx("li", { children: bullet }, bullet)) }),
        /* @__PURE__ */ jsx(NewsletterForm, {})
      ] })
    ] }) })
  );
});
export {
  GET,
  POST
};
