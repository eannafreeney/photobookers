import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  Behavior,
  Modifier,
  Option,
  SelectSingle,
  Style,
  Text
} from "../../../lib/hxml-comps.js";
const tabLoadBehavior = (baseUrl, path) => ({
  trigger: "select",
  verb: "get",
  href: `${baseUrl}/hyperview/settings/tab/${path}`,
  action: "replace-inner",
  target: "tab-area",
  "hide-during-load": "tab-area",
  "show-during-load": "tab-spinner"
});
const SettingsTabs = ({ baseUrl, activeTab = "terms" }) => /* @__PURE__ */ jsxs(SelectSingle, { style: "tab-bar", name: "settings-tab", children: [
  /* @__PURE__ */ jsxs(
    Option,
    {
      value: "terms",
      style: "tab-btn",
      selected: activeTab === "terms" ? "true" : void 0,
      children: [
        /* @__PURE__ */ jsx(Behavior, { ...tabLoadBehavior(baseUrl, "terms") }),
        /* @__PURE__ */ jsx(Text, { style: "tab-label", children: "TERMS" })
      ]
    }
  ),
  /* @__PURE__ */ jsxs(
    Option,
    {
      value: "privacy",
      style: "tab-btn",
      selected: activeTab === "privacy" ? "true" : void 0,
      children: [
        /* @__PURE__ */ jsx(Behavior, { ...tabLoadBehavior(baseUrl, "privacy") }),
        /* @__PURE__ */ jsx(Text, { style: "tab-label", children: "PRIVACY" })
      ]
    }
  )
] });
var SettingsTabs_default = SettingsTabs;
const settingsTabStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
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
  SettingsTabs_default as default,
  settingsTabStyles
};
