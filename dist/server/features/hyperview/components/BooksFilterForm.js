import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  Behavior,
  Form,
  Style,
  Text,
  TextField,
  View
} from "../../../lib/hxml-comps.js";
const BOOKS_LIST_TARGET_ID = "books-list-host";
const BOOKS_SEARCH_BAR_ID = "books-search-bar-area";
const BOOKS_FILTER_Q_ID = "books-filter-q";
const BooksFilterForm = ({ baseUrl }) => /* @__PURE__ */ jsx(Form, { id: "books-filter-form", children: /* @__PURE__ */ jsxs(View, { style: "books-filter-row", children: [
  /* @__PURE__ */ jsx(
    TextField,
    {
      id: BOOKS_FILTER_Q_ID,
      style: "books-filter-input",
      name: "q",
      placeholder: "Filter by title, artist, publisher, or tag\u2026",
      children: /* @__PURE__ */ jsx(
        Behavior,
        {
          trigger: "change",
          delay: 400,
          verb: "post",
          action: "replace",
          target: BOOKS_LIST_TARGET_ID,
          href: `${baseUrl}/hyperview/books`
        }
      )
    }
  ),
  /* @__PURE__ */ jsxs(View, { style: "books-filter-cancel", children: [
    /* @__PURE__ */ jsx(Text, { style: "books-filter-cancel-label", children: "Cancel" }),
    /* @__PURE__ */ jsx(Behavior, { action: "set-value", target: BOOKS_FILTER_Q_ID, "new-value": "" }),
    /* @__PURE__ */ jsx(
      Behavior,
      {
        delay: 50,
        verb: "post",
        action: "replace",
        target: BOOKS_LIST_TARGET_ID,
        href: `${baseUrl}/hyperview/books`
      }
    )
  ] })
] }) });
var BooksFilterForm_default = BooksFilterForm;
const booksFilterFormStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "books-search-bar",
      paddingTop: 12,
      paddingBottom: 12,
      paddingLeft: 16,
      paddingRight: 16,
      backgroundColor: "#fbfaf7",
      borderBottomWidth: 1,
      borderBottomColor: "#e4e0d5"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "books-filter-row",
      flexDirection: "row",
      alignItems: "center",
      gap: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "books-filter-input",
      flex: 1,
      borderWidth: 1,
      borderColor: "#e4e0d5",
      borderRadius: 0,
      paddingTop: 12,
      paddingBottom: 12,
      paddingLeft: 14,
      paddingRight: 14,
      fontSize: 15,
      backgroundColor: "#fbfaf7",
      color: "#191613"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "books-filter-cancel",
      paddingTop: 12,
      paddingBottom: 12,
      paddingLeft: 12,
      paddingRight: 12,
      flexShrink: 0
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "books-filter-cancel-label",
      fontSize: 15,
      fontWeight: "600",
      color: "#45413a"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "books-list-panel", flex: 1 })
] });
export {
  BOOKS_FILTER_Q_ID,
  BOOKS_LIST_TARGET_ID,
  BOOKS_SEARCH_BAR_ID,
  booksFilterFormStyles,
  BooksFilterForm_default as default
};
