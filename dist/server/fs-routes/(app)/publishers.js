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
  const [error, result] = await getAllCreatorsByType(
    "publisher",
    currentPage,
    50
  );
  if (error) return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Publishers not found" }));
  const title = pageTitle("Publishers");
  const description = "Discover photobook publishers on photobookers. Browse catalogues and find where to buy titles.";
  const { creators, totalPages, page } = result;
  const targetId = "publishers-grid";
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title,
        description,
        canonicalUrl: canonicalUrl(c.req.url, "/publishers"),
        user,
        currentPath,
        children: /* @__PURE__ */ jsxs(Page, { children: [
          /* @__PURE__ */ jsx(
            PageHeader,
            {
              kicker: "The Houses",
              title: "Publishers",
              intro: "Independent presses and publishing houses \u2014 browse their catalogues and find where to buy."
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
