import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import BooksGrid from "../BooksGrid.js";
import CreatorCard from "../../../../components/app/CreatorCard.js";
import CreatorsGrid from "../CreatorsGrid.js";
import Tabs from "../../../../components/app/Tabs.js";
import CreatorPosts from "./CreatorPosts.js";
import UpcomingFairsSection from "../../fairs/components/UpcomingFairsSection.js";
const CreatorDetailTabs = ({
  isMobile = false,
  creator,
  user,
  currentPath,
  result,
  showCreatorsTab,
  showFairsTab,
  showPostsTab,
  creatorsCurrentPage,
  postCount,
  upcomingFairs
}) => /* @__PURE__ */ jsxs(Tabs, { defaultTab: "books", children: [
  /* @__PURE__ */ jsxs(Tabs.LinkContainer, { align: isMobile ? void 0 : "left", children: [
    /* @__PURE__ */ jsx(Tabs.Link, { tabId: "books", children: "Books" }),
    showPostsTab && /* @__PURE__ */ jsx(Tabs.Link, { tabId: "posts", children: `Posts (${postCount})` }),
    showCreatorsTab && /* @__PURE__ */ jsx(Tabs.Link, { tabId: "creators", children: creator.type === "publisher" ? "Artists" : "Publishers" }),
    showFairsTab && /* @__PURE__ */ jsx(Tabs.Link, { tabId: "fairs", children: "Fairs" }),
    isMobile && /* @__PURE__ */ jsx(Tabs.Link, { tabId: "about", children: "About" })
  ] }),
  /* @__PURE__ */ jsx(Tabs.Panel, { tabId: "books", children: /* @__PURE__ */ jsx(
    BooksGrid,
    {
      isMobile,
      isInfiniteScroll: !isMobile,
      user,
      currentPath,
      result,
      currentCreatorId: creator.id,
      noResultsMessage: "No books found"
    }
  ) }),
  /* @__PURE__ */ jsx(Tabs.Panel, { tabId: "posts", children: isMobile ? /* @__PURE__ */ jsx(CreatorPosts, { creatorSlug: creator.slug, user }) : /* @__PURE__ */ jsx("div", { class: "mx-auto w-full max-w-[600px]", children: /* @__PURE__ */ jsx(CreatorPosts, { creatorSlug: creator.slug, user }) }) }),
  /* @__PURE__ */ jsx(Tabs.Panel, { tabId: "creators", children: /* @__PURE__ */ jsx(
    CreatorsGrid,
    {
      isMobile,
      isInfiniteScroll: isMobile,
      user,
      currentPage: creatorsCurrentPage,
      creatorId: creator.id,
      creatorType: creator.type,
      currentPath,
      pageParam: "creatorsPage"
    }
  ) }),
  /* @__PURE__ */ jsx(Tabs.Panel, { tabId: "fairs", children: /* @__PURE__ */ jsx(UpcomingFairsSection, { fairs: upcomingFairs }) }),
  isMobile && /* @__PURE__ */ jsxs(Tabs.Panel, { tabId: "about", children: [
    /* @__PURE__ */ jsx(
      CreatorCard,
      {
        creator,
        currentPath,
        user,
        shouldRefreshCreatorPosts: true,
        showHeader: false
      }
    ),
    /* @__PURE__ */ jsx(
      CreatorsGrid,
      {
        user,
        currentPage: creatorsCurrentPage,
        creatorId: creator.id,
        creatorType: creator.type,
        currentPath,
        title: "You may also like...",
        pageParam: "creatorsPage"
      }
    )
  ] })
] });
var CreatorDetailTab_default = CreatorDetailTabs;
export {
  CreatorDetailTab_default as default
};
