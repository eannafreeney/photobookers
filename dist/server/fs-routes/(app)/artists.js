import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../utils.js";
import Page from "../../components/layouts/Page.js";
import AppLayout from "../../components/layouts/AppLayout.js";
import InfoPage from "../../pages/InfoPage.js";
import { getAllCreatorsByType } from "../../features/app/services.js";
import PageHeader from "../../components/app/PageHeader.js";
import CreatorsCircle from "../../features/app/components/CreatorsCircle.js";
import ScrollReveal from "../../components/app/ScrollReveal.js";
import { InfiniteScroll } from "../../components/app/InfiniteScroll.js";
import { canonicalUrl, pageTitle } from "../../lib/seo.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;
  const [error, result] = await getAllCreatorsByType("artist", currentPage, 50);
  if (error) return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Artists not found" }));
  const title = pageTitle("Artists");
  const description = "Discover photobook artists on photobookers. Browse profiles and explore their published work.";
  const { creators, totalPages, page } = result;
  const targetId = "artists-grid";
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title,
        description,
        canonicalUrl: canonicalUrl(c.req.url, "/artists"),
        user,
        currentPath,
        children: /* @__PURE__ */ jsxs(Page, { children: [
          /* @__PURE__ */ jsx(
            PageHeader,
            {
              kicker: "The People",
              title: "Artists",
              intro: "The photographers and artists behind the books \u2014 browse their profiles and explore their published work."
            }
          ),
          /* @__PURE__ */ jsxs("div", { "x-data": true, children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                id: targetId,
                "x-merge": "append",
                class: "grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-6",
                children: creators.map((creator) => /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(CreatorsCircle, { creator }) }))
              }
            ),
            /* @__PURE__ */ jsx(
              InfiniteScroll,
              {
                baseUrl: currentPath,
                page,
                totalPages,
                targetId
              }
            )
          ] })
        ] })
      }
    )
  );
});
export {
  GET
};
