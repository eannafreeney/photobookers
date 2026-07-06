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
const FAIRS_TAB_TARGET_ID = "fairs-tab-area";
const tabLoadBehavior = (baseUrl, path) => ({
  trigger: "select",
  verb: "get",
  href: `${baseUrl}/hyperview/fairs/tab/${path}`,
  action: "replace-inner",
  target: FAIRS_TAB_TARGET_ID,
  "hide-during-load": FAIRS_TAB_TARGET_ID,
  "show-during-load": "fairs-tab-spinner"
});
const FairsTabs = ({ baseUrl, activeTab = "current" }) => /* @__PURE__ */ jsx(View, { style: "fairs-tabs-sticky", children: /* @__PURE__ */ jsxs(SelectSingle, { style: "tab-bar", name: "tab", children: [
  /* @__PURE__ */ jsxs(
    Option,
    {
      value: "upcoming",
      style: "tab-btn",
      selected: activeTab === "upcoming" ? "true" : void 0,
      children: [
        /* @__PURE__ */ jsx(Behavior, { ...tabLoadBehavior(baseUrl, "upcoming") }),
        /* @__PURE__ */ jsx(Text, { style: "tab-label", children: "UPCOMING" })
      ]
    }
  ),
  /* @__PURE__ */ jsxs(
    Option,
    {
      value: "current",
      style: "tab-btn",
      selected: activeTab === "current" ? "true" : void 0,
      children: [
        /* @__PURE__ */ jsx(Behavior, { ...tabLoadBehavior(baseUrl, "current") }),
        /* @__PURE__ */ jsx(Text, { style: "tab-label", children: "HAPPENING NOW" })
      ]
    }
  ),
  /* @__PURE__ */ jsxs(
    Option,
    {
      value: "past",
      style: "tab-btn",
      selected: activeTab === "past" ? "true" : void 0,
      children: [
        /* @__PURE__ */ jsx(Behavior, { ...tabLoadBehavior(baseUrl, "past") }),
        /* @__PURE__ */ jsx(Text, { style: "tab-label", children: "PAST" })
      ]
    }
  )
] }) });
var FairsTabs_default = FairsTabs;
const fairsTabStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fairs-tabs-sticky",
      backgroundColor: "#fbfaf7",
      borderBottomWidth: 1,
      borderBottomColor: "#e4e0d5"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "tab-bar",
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#e4e0d5"
    }
  ),
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
      fontSize: 10,
      fontWeight: "600",
      letterSpacing: 1,
      color: "#a39d90",
      children: /* @__PURE__ */ jsx(Modifier, { selected: "true", children: /* @__PURE__ */ jsx(Style, { color: "#a22c29" }) })
    }
  )
] });
export {
  FAIRS_TAB_TARGET_ID,
  FairsTabs_default as default,
  fairsTabStyles
};
