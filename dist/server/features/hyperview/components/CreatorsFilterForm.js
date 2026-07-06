import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  Behavior,
  Form,
  Style,
  Text,
  TextField,
  View
} from "../../../lib/hxml-comps.js";
const CREATORS_TAB_TARGET_ID = "tab-area";
const CREATORS_SEARCH_BAR_ID = "creators-search-bar-area";
const CREATORS_FILTER_Q_ID = "creators-filter-q";
const CreatorsFilterForm = ({ baseUrl }) => /* @__PURE__ */ jsx(Form, { id: "creators-filter-form", children: /* @__PURE__ */ jsxs(View, { style: "creators-filter-row", children: [
  /* @__PURE__ */ jsx(
    TextField,
    {
      id: CREATORS_FILTER_Q_ID,
      style: "creators-filter-input",
      name: "q",
      placeholder: "Filter by creator name\u2026",
      children: /* @__PURE__ */ jsx(
        Behavior,
        {
          trigger: "change",
          delay: 400,
          verb: "post",
          action: "replace",
          target: CREATORS_TAB_TARGET_ID,
          href: `${baseUrl}/hyperview/creators`
        }
      )
    }
  ),
  /* @__PURE__ */ jsxs(View, { style: "creators-filter-cancel", children: [
    /* @__PURE__ */ jsx(Text, { style: "creators-filter-cancel-label", children: "Cancel" }),
    /* @__PURE__ */ jsx(
      Behavior,
      {
        action: "set-value",
        target: CREATORS_FILTER_Q_ID,
        "new-value": ""
      }
    ),
    /* @__PURE__ */ jsx(
      Behavior,
      {
        delay: 50,
        verb: "post",
        action: "replace",
        target: CREATORS_TAB_TARGET_ID,
        href: `${baseUrl}/hyperview/creators`
      }
    )
  ] })
] }) });
var CreatorsFilterForm_default = CreatorsFilterForm;
const creatorsFilterFormStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creators-search-bar",
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
      id: "creators-filter-row",
      flexDirection: "row",
      alignItems: "center",
      gap: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creators-filter-input",
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
      id: "creators-filter-cancel",
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
      id: "creators-filter-cancel-label",
      fontSize: 15,
      fontWeight: "600",
      color: "#45413a"
    }
  )
] });
export {
  CREATORS_FILTER_Q_ID,
  CREATORS_SEARCH_BAR_ID,
  CREATORS_TAB_TARGET_ID,
  creatorsFilterFormStyles,
  CreatorsFilterForm_default as default
};
