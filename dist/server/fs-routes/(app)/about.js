import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import PageHeader from "../../components/app/PageHeader.js";
import Page from "../../components/layouts/Page.js";
import AppLayout from "../../components/layouts/AppLayout.js";
import AboutPageContent from "../../features/app/components/AboutPageContent.js";
import { aboutPageMeta } from "../../features/app/content/aboutPageContent.js";
import { canonicalUrl, pageTitle } from "../../lib/seo.js";
const GET = createRoute(async (c) => {
  const currentPath = c.req.path;
  const title = pageTitle("About");
  const description = "Photobookers is a place to discover photobooks, follow artists and publishers, and explore book fairs \u2014 for fans, artists, and publishers.";
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title,
        description,
        canonicalUrl: canonicalUrl(c.req.url, "/about"),
        currentPath,
        children: /* @__PURE__ */ jsxs(Page, { children: [
          /* @__PURE__ */ jsx(
            PageHeader,
            {
              kicker: "About",
              title: aboutPageMeta.title,
              intro: aboutPageMeta.intro
            }
          ),
          /* @__PURE__ */ jsx(AboutPageContent, {})
        ] })
      }
    )
  );
});
export {
  GET
};
