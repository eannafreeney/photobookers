import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  Modifier,
  Option,
  SelectSingle,
  Style,
  View
} from "../../../lib/hxml-comps.js";
import { Text } from "../../../lib/hxml-comps.js";
const BookTabs = ({
  baseUrl,
  bookId,
  hasPublisher,
  activeTab = "book"
}) => {
  return /* @__PURE__ */ jsx(View, { style: "book-tabs-sticky", sticky: "true", children: /* @__PURE__ */ jsxs(SelectSingle, { style: "tab-bar", name: "tab", children: [
    /* @__PURE__ */ jsx(
      Option,
      {
        value: "book",
        style: "tab-btn",
        selected: activeTab === "book" ? "true" : void 0,
        trigger: "select",
        href: `${baseUrl}/hyperview/books/${bookId}/tab/book-content`,
        action: "replace-inner",
        target: "tab-area",
        "hide-during-load": "tab-area",
        "show-during-load": "tab-spinner",
        children: /* @__PURE__ */ jsx(Text, { style: "tab-label", children: "BOOK" })
      }
    ),
    /* @__PURE__ */ jsx(
      Option,
      {
        value: "comments",
        style: "tab-btn",
        selected: activeTab === "comments" ? "true" : void 0,
        trigger: "select",
        href: `${baseUrl}/hyperview/books/${bookId}/tab/comments`,
        action: "replace-inner",
        target: "tab-area",
        "hide-during-load": "tab-area",
        "show-during-load": "tab-spinner",
        children: /* @__PURE__ */ jsx(Text, { style: "tab-label", children: "COMMENTS" })
      }
    ),
    /* @__PURE__ */ jsx(
      Option,
      {
        value: "artist",
        style: "tab-btn",
        selected: activeTab === "artist" ? "true" : void 0,
        trigger: "select",
        href: `${baseUrl}/hyperview/books/${bookId}/tab/artist`,
        action: "replace-inner",
        target: "tab-area",
        "hide-during-load": "tab-area",
        "show-during-load": "tab-spinner",
        children: /* @__PURE__ */ jsx(Text, { style: "tab-label", children: "ARTIST" })
      }
    ),
    hasPublisher && /* @__PURE__ */ jsx(
      Option,
      {
        value: "publisher",
        style: "tab-btn",
        selected: activeTab === "publisher" ? "true" : void 0,
        trigger: "select",
        href: `${baseUrl}/hyperview/books/${bookId}/tab/publisher`,
        action: "replace-inner",
        target: "tab-area",
        "hide-during-load": "tab-area",
        "show-during-load": "tab-spinner",
        children: /* @__PURE__ */ jsx(Text, { style: "tab-label", children: "PUBLISHER" })
      }
    )
  ] }) });
};
var BookTabs_default = BookTabs;
const bookTabStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-tabs-sticky",
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
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "tab-spinner",
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 40
    }
  )
] });
export {
  bookTabStyles,
  BookTabs_default as default
};
