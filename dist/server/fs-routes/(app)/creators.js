import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../utils.js";
import Page from "../../components/layouts/Page.js";
import AppLayout from "../../components/layouts/AppLayout.js";
import InfoPage from "../../pages/InfoPage.js";
import {
  getAllCreatorsByType,
  getAllCreatorsForBrowse,
  getFollowedCreatorsForBrowse
} from "../../features/app/services.js";
import PageHeader from "../../components/app/PageHeader.js";
import CreatorsCircle from "../../features/app/components/CreatorsCircle.js";
import CreatorsBrowseFilters from "../../features/app/components/CreatorsBrowseFilters.js";
import ScrollReveal from "../../components/app/ScrollReveal.js";
import ListNavigation from "../../features/app/components/ListNavigation.js";
import {
  creatorsBrowseUrl,
  CREATOR_CATALOG_TARGET_ID,
  parseCreatorBrowseFilter
} from "../../features/app/creatorsBrowse.js";
import { paginationRequestBaseUrl } from "../../lib/pagination.js";
import { ok } from "../../lib/result.js";
import { canonicalUrl, pageTitle } from "../../lib/seo.js";
const PAGE_SIZE = 48;
const targetId = "creators-grid";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPage = Number(c.req.query("page") ?? 1);
  const filter = parseCreatorBrowseFilter(c.req.query("type"), Boolean(user));
  const paginationBaseUrl = paginationRequestBaseUrl(c.req.url);
  const canonicalPath = creatorsBrowseUrl(filter);
  const [error, result] = await loadCreatorsForFilter(
    filter,
    currentPage,
    user
  );
  if (error) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Creators not found", user }));
  }
  const { creators, totalPages, page } = result;
  const catalog = /* @__PURE__ */ jsx(
    CreatorsBrowseCatalog,
    {
      filter,
      creators,
      page,
      totalPages,
      paginationBaseUrl,
      user
    }
  );
  if (c.req.query("fragment") === "catalog") {
    return c.html(catalog);
  }
  const title = pageTitle("Creators");
  const description = "Discover photobook artists and publishers on photobookers. Browse profiles and explore their published work.";
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title,
        description,
        canonicalUrl: canonicalUrl(c.req.url, canonicalPath),
        user,
        currentPath: canonicalPath,
        children: /* @__PURE__ */ jsxs(Page, { children: [
          /* @__PURE__ */ jsx(
            PageHeader,
            {
              kicker: "The People",
              title: "Creators",
              intro: "Artists and publishers behind the books \u2014 browse profiles and explore their published work."
            }
          ),
          /* @__PURE__ */ jsx("div", { "x-data": true, "x-ref": "paginationContent", children: catalog })
        ] })
      }
    )
  );
});
async function loadCreatorsForFilter(filter, page, user) {
  switch (filter) {
    case "artist":
      return getAllCreatorsByType("artist", page, PAGE_SIZE);
    case "publisher":
      return getAllCreatorsByType("publisher", page, PAGE_SIZE);
    case "following":
      if (!user) {
        return ok({ creators: [], totalPages: 1, page: 1 });
      }
      return getFollowedCreatorsForBrowse(user.id, page, PAGE_SIZE);
    default:
      return getAllCreatorsForBrowse(page, PAGE_SIZE);
  }
}
const CreatorsBrowseCatalog = ({
  filter,
  creators,
  page,
  totalPages,
  paginationBaseUrl,
  user
}) => /* @__PURE__ */ jsxs("div", { id: CREATOR_CATALOG_TARGET_ID, "x-merge": "replace", children: [
  /* @__PURE__ */ jsx(CreatorsBrowseFilters, { activeFilter: filter, user }),
  /* @__PURE__ */ jsx(
    "div",
    {
      id: targetId,
      "x-merge": "append",
      class: "grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-6",
      children: creators.map((creator) => /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(
        CreatorsCircle,
        {
          creator,
          showType: filter === "all" || filter === "following"
        }
      ) }))
    }
  ),
  /* @__PURE__ */ jsx(
    ListNavigation,
    {
      isInfiniteScroll: true,
      currentPath: paginationBaseUrl,
      page,
      totalPages,
      targetId
    }
  )
] });
export {
  GET
};
