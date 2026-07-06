import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  Modifier,
  Option,
  SelectSingle,
  Style,
  View
} from "../../../lib/hxml-comps.js";
import { Text } from "../../../lib/hxml-comps.js";
const CreatorTabs = ({
  baseUrl,
  creatorId,
  creatorType,
  activeTab = "books"
}) => {
  return /* @__PURE__ */ jsx(View, { style: "creator-tabs-sticky", sticky: "true", children: /* @__PURE__ */ jsxs(SelectSingle, { style: "tab-bar", name: "tab", children: [
    /* @__PURE__ */ jsx(
      Option,
      {
        value: "books",
        style: "tab-btn",
        selected: activeTab === "books" ? "true" : void 0,
        trigger: "select",
        href: `${baseUrl}/hyperview/creators/${creatorId}/tab/books-content`,
        action: "replace-inner",
        target: "tab-area",
        "hide-during-load": "tab-area",
        "show-during-load": "tab-spinner",
        children: /* @__PURE__ */ jsx(Text, { style: "tab-label", children: "BOOKS" })
      }
    ),
    /* @__PURE__ */ jsx(
      Option,
      {
        value: "messages",
        style: "tab-btn",
        selected: activeTab === "messages" ? "true" : void 0,
        trigger: "select",
        href: `${baseUrl}/hyperview/creators/${creatorId}/tab/messages`,
        action: "replace-inner",
        target: "tab-area",
        "hide-during-load": "tab-area",
        "show-during-load": "tab-spinner",
        children: /* @__PURE__ */ jsx(Text, { style: "tab-label", children: "POSTS" })
      }
    ),
    /* @__PURE__ */ jsx(
      Option,
      {
        value: creatorType === "publisher" ? "publishers" : "artists",
        style: "tab-btn",
        selected: activeTab === (creatorType === "publisher" ? "publishers" : "artists") ? "true" : void 0,
        trigger: "select",
        href: `${baseUrl}/hyperview/creators/${creatorId}/tab/${creatorType === "publisher" ? "artists" : "publishers"}`,
        action: "replace-inner",
        target: "tab-area",
        "hide-during-load": "tab-area",
        "show-during-load": "tab-spinner",
        children: /* @__PURE__ */ jsx(Text, { style: "tab-label", children: creatorType === "publisher" ? "ARTISTS" : "PUBLISHERS" })
      }
    ),
    /* @__PURE__ */ jsx(
      Option,
      {
        value: "about",
        style: "tab-btn",
        selected: activeTab === "about" ? "true" : void 0,
        trigger: "select",
        href: `${baseUrl}/hyperview/creators/${creatorId}/tab/about`,
        action: "replace-inner",
        target: "tab-area",
        "hide-during-load": "tab-area",
        "show-during-load": "tab-spinner",
        children: /* @__PURE__ */ jsx(Text, { style: "tab-label", children: "ABOUT" })
      }
    )
  ] }) });
};
var CreatorTabs_default = CreatorTabs;
const creatorTabStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
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
      paddingTop: 5,
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
  creatorTabStyles,
  CreatorTabs_default as default
};
