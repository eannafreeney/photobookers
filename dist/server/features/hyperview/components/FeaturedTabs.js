import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  Behavior,
  Modifier,
  Option,
  SelectSingle,
  Style,
  Text,
  View
} from "../../../lib/hxml-comps.js";
import {
  FEATURED_TAB_BODY_ID,
  FEATURED_TAB_SPINNER_ID
} from "./featuredTabIds.js";
const tabLoadBehavior = (baseUrl, path) => ({
  trigger: "select",
  verb: "get",
  href: `${baseUrl}/hyperview/featured/tab/${path}`,
  action: "replace-inner",
  target: FEATURED_TAB_BODY_ID,
  "hide-during-load": FEATURED_TAB_BODY_ID,
  "show-during-load": FEATURED_TAB_SPINNER_ID
});
const FeaturedTabs = ({ baseUrl, activeTab = "home" }) => {
  return /* @__PURE__ */ jsx(View, { style: "featured-tabs-sticky", sticky: "true", children: /* @__PURE__ */ jsxs(SelectSingle, { style: "tab-bar", name: "tab", children: [
    /* @__PURE__ */ jsxs(
      Option,
      {
        value: "home",
        style: "tab-btn",
        selected: activeTab === "home" ? "true" : void 0,
        children: [
          /* @__PURE__ */ jsx(Behavior, { ...tabLoadBehavior(baseUrl, "home-content") }),
          /* @__PURE__ */ jsx(Text, { style: "tab-label", children: "HOME" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      Option,
      {
        value: "feed",
        style: "tab-btn",
        selected: activeTab === "feed" ? "true" : void 0,
        children: [
          /* @__PURE__ */ jsx(Behavior, { ...tabLoadBehavior(baseUrl, "feed") }),
          /* @__PURE__ */ jsx(Text, { style: "tab-label", children: "FEED" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      Option,
      {
        value: "messages",
        style: "tab-btn",
        selected: activeTab === "messages" ? "true" : void 0,
        children: [
          /* @__PURE__ */ jsx(Behavior, { ...tabLoadBehavior(baseUrl, "messages") }),
          /* @__PURE__ */ jsx(Text, { style: "tab-label", children: "MESSAGES" })
        ]
      }
    )
  ] }) });
};
var FeaturedTabs_default = FeaturedTabs;
const featuredTabStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "featured-tabs-sticky",
      backgroundColor: "#fbfaf7",
      borderBottomWidth: 1,
      borderBottomColor: "#e4e0d5"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "featured-tab-panel",
      flex: 1,
      position: "relative",
      minHeight: 480,
      margin: 16
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "featured-tab-spinner",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "featured-tab-body", flex: 1 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "tab-btn",
      flex: 1,
      paddingTop: 10,
      paddingBottom: 10,
      alignItems: "center",
      children: /* @__PURE__ */ jsx(Modifier, { selected: "true", children: /* @__PURE__ */ jsx(Style, { borderBottomWidth: 2, borderBottomColor: "#a22c29" }) })
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "tab-label",
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 1.5,
      color: "#a39d90",
      children: /* @__PURE__ */ jsx(Modifier, { selected: "true", children: /* @__PURE__ */ jsx(Style, { color: "#a22c29" }) })
    }
  )
] });
export {
  FeaturedTabs_default as default,
  featuredTabStyles
};
