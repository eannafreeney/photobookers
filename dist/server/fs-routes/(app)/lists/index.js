import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import AppLayout from "../../../components/layouts/AppLayout.js";
import Page from "../../../components/layouts/Page.js";
import { getUser } from "../../../utils.js";
import InfoPage from "../../../pages/InfoPage.js";
import { getPromotedLists } from "../../../domain/lists/services.js";
import PromotedListCard from "../../../features/app/components/PromotedListCard.js";
import PageHeader from "../../../components/app/PageHeader.js";
import { canonicalUrl, pageTitle } from "../../../lib/seo.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const [error, lists] = await getPromotedLists(24);
  if (error) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: error.reason, user }));
  }
  if (!lists?.length) {
    return c.html(
      /* @__PURE__ */ jsx(InfoPage, { errorMessage: "No promoted lists yet", user })
    );
  }
  const title = pageTitle("Lists");
  const description = "Curated photobook lists from collectors and creators on Photobookers.";
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title,
        description,
        canonicalUrl: canonicalUrl(c.req.url, "/lists"),
        user,
        currentPath,
        children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-6", children: [
          /* @__PURE__ */ jsx(
            PageHeader,
            {
              kicker: "From collectors",
              title: "Lists",
              intro: "Playlist-style photobook lists curated by the community."
            }
          ),
          /* @__PURE__ */ jsx("div", { class: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: lists.map((list) => /* @__PURE__ */ jsx(PromotedListCard, { list, widthClass: "w-full" })) })
        ] }) })
      }
    )
  );
});
export {
  GET
};
