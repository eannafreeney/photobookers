import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Tabs from "../../../../components/app/Tabs.js";
import FairsGrid from "./FairsGrid.js";
const FairsWithTabs = ({
  tab,
  upcomingFairs = [],
  upcomingPage = 1,
  upcomingTotalPages = 1,
  currentFairs = [],
  currentPage = 1,
  currentTotalPages = 1,
  pastFairs = [],
  pastPage = 1,
  pastTotalPages = 1,
  baseUrl
}) => {
  return /* @__PURE__ */ jsxs(Tabs, { defaultTab: tab, children: [
    /* @__PURE__ */ jsxs(Tabs.LinkContainer, { children: [
      /* @__PURE__ */ jsx(Tabs.Link, { tabId: "upcoming", children: "Upcoming" }),
      /* @__PURE__ */ jsx(Tabs.Link, { tabId: "current", children: "Happening Now" }),
      /* @__PURE__ */ jsx(Tabs.Link, { tabId: "past", children: "Past" })
    ] }),
    /* @__PURE__ */ jsx(Tabs.Panel, { tabId: "upcoming", children: /* @__PURE__ */ jsx(
      FairsGrid,
      {
        fairs: upcomingFairs,
        page: upcomingPage,
        totalPages: upcomingTotalPages,
        baseUrl: `${baseUrl}?tab=upcoming`,
        targetId: "upcoming-fairs-grid"
      }
    ) }),
    /* @__PURE__ */ jsx(Tabs.Panel, { tabId: "current", children: /* @__PURE__ */ jsx(
      FairsGrid,
      {
        fairs: currentFairs,
        page: currentPage,
        totalPages: currentTotalPages,
        baseUrl: `${baseUrl}?tab=current`,
        targetId: "current-fairs-grid"
      }
    ) }),
    /* @__PURE__ */ jsx(Tabs.Panel, { tabId: "past", children: /* @__PURE__ */ jsx(
      FairsGrid,
      {
        fairs: pastFairs,
        page: pastPage,
        totalPages: pastTotalPages,
        baseUrl: `${baseUrl}?tab=past`,
        targetId: "past-fairs-grid"
      }
    ) })
  ] });
};
var FairsWithTabs_default = FairsWithTabs;
export {
  FairsWithTabs_default as default
};
