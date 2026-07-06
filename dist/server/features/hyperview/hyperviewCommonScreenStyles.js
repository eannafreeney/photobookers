import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Style } from "../../lib/hxml-comps.js";
const signInEmptyHintStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "featured-signin-hint",
      fontSize: 14,
      color: "#45413a",
      lineHeight: 22,
      paddingTop: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "featured-empty-hint",
      fontSize: 14,
      color: "#45413a",
      lineHeight: 22,
      paddingTop: 8
    }
  )
] });
const messageListStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "message-row",
      paddingTop: 14,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: "#e4e0d5"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "message-from",
      fontSize: 15,
      fontWeight: "600",
      color: "#191613",
      marginBottom: 4
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "message-date", fontSize: 12, color: "#a39d90", marginBottom: 8 }),
  /* @__PURE__ */ jsx(Style, { id: "message-preview", fontSize: 14, color: "#45413a", lineHeight: 20 })
] });
export {
  messageListStyles,
  signInEmptyHintStyles
};
