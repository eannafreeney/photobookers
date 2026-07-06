import { jsx } from "hono/jsx/jsx-runtime";
import Pill from "../../../../../components/app/Pill.js";
import {
  ADMIN_ANALYTICS_PANEL_ID,
  adminAnalyticsHref
} from "../adminAnalyticsPanel.js";
function parseAnalyticsSectionTab(raw) {
  if (raw === "overview") return "overview";
  if (raw === "site") return "site";
  if (raw === "app") return "app";
  if (raw === "newsletter") return "newsletter";
  return "overview";
}
const TABS = [
  { id: "overview", label: "Overview" },
  { id: "books", label: "Book analytics" },
  { id: "site", label: "Site analytics" },
  { id: "app", label: "App analytics" },
  { id: "newsletter", label: "Newsletter" }
];
const pillButtonClass = "cursor-pointer border-0 bg-transparent p-0 font-inherit";
const AnalyticsSectionTabs = ({ activeTab, dateRange }) => {
  return /* @__PURE__ */ jsx("div", { class: "flex flex-wrap items-center justify-center gap-2", children: TABS.map((tab) => /* @__PURE__ */ jsx(
    "a",
    {
      href: adminAnalyticsHref(dateRange, {
        tab: tab.id,
        fragment: true
      }),
      "x-target": ADMIN_ANALYTICS_PANEL_ID,
      prefetch: "intent",
      "aria-current": activeTab === tab.id ? "page" : void 0,
      class: pillButtonClass,
      children: /* @__PURE__ */ jsx(Pill, { variant: activeTab === tab.id ? "inverse" : "default", children: tab.label })
    },
    tab.id
  )) });
};
var AnalyticsSectionTabs_default = AnalyticsSectionTabs;
export {
  AnalyticsSectionTabs_default as default,
  parseAnalyticsSectionTab
};
