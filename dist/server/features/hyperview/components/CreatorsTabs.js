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
const tabLoadBehavior = (baseUrl, path) => ({
  trigger: "select",
  verb: "get",
  href: `${baseUrl}/hyperview/creators/tab/${path}`,
  action: "replace-inner",
  target: "tab-area",
  "hide-during-load": "tab-area",
  "show-during-load": "tab-spinner"
});
const CreatorsTabs = ({
  baseUrl,
  activeTab = "following"
}) => {
  return /* @__PURE__ */ jsx(View, { style: "creator-tabs-sticky", children: /* @__PURE__ */ jsxs(SelectSingle, { style: "tab-bar", name: "tab", children: [
    /* @__PURE__ */ jsxs(
      Option,
      {
        value: "all",
        style: "tab-btn",
        selected: activeTab === "all" ? "true" : void 0,
        children: [
          /* @__PURE__ */ jsx(Behavior, { ...tabLoadBehavior(baseUrl, "all") }),
          /* @__PURE__ */ jsx(Text, { style: "tab-label", children: "ALL" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      Option,
      {
        value: "publishers",
        style: "tab-btn",
        selected: activeTab === "publishers" ? "true" : void 0,
        children: [
          /* @__PURE__ */ jsx(Behavior, { ...tabLoadBehavior(baseUrl, "publishers") }),
          /* @__PURE__ */ jsx(Text, { style: "tab-label", children: "PUBLISHERS" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      Option,
      {
        value: "artists",
        style: "tab-btn",
        selected: activeTab === "artists" ? "true" : void 0,
        children: [
          /* @__PURE__ */ jsx(Behavior, { ...tabLoadBehavior(baseUrl, "artists") }),
          /* @__PURE__ */ jsx(Text, { style: "tab-label", children: "ARTISTS" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      Option,
      {
        value: "following",
        style: "tab-btn",
        selected: activeTab === "following" ? "true" : void 0,
        children: [
          /* @__PURE__ */ jsx(Behavior, { ...tabLoadBehavior(baseUrl, "following") }),
          /* @__PURE__ */ jsx(Text, { style: "tab-label", children: "FOLLOWING" })
        ]
      }
    )
  ] }) });
};
var CreatorsTabs_default = CreatorsTabs;
const creatorsTabStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creator-tabs-sticky",
      backgroundColor: "#fbfaf7",
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
      letterSpacing: 1.5,
      color: "#a39d90",
      children: /* @__PURE__ */ jsx(Modifier, { selected: "true", children: /* @__PURE__ */ jsx(Style, { color: "#a22c29" }) })
    }
  )
] });
export {
  creatorsTabStyles,
  CreatorsTabs_default as default
};
