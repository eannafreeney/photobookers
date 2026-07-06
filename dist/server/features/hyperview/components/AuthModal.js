import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  Behavior,
  Body,
  Doc,
  Screen,
  Style,
  Styles,
  Text,
  View
} from "../../../lib/hxml-comps.js";
const AuthModal = ({ actionPhrase, baseUrl }) => {
  return /* @__PURE__ */ jsx(Doc, { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsxs(Screen, { children: [
    /* @__PURE__ */ jsx(Styles, { children: modalStyles() }),
    /* @__PURE__ */ jsxs(Body, { style: "auth-modal-body", scroll: "false", children: [
      /* @__PURE__ */ jsx(View, { style: "auth-modal-top", children: /* @__PURE__ */ jsxs(View, { style: "auth-modal-close-hit", children: [
        /* @__PURE__ */ jsx(Behavior, { action: "close", href: "#" }),
        /* @__PURE__ */ jsx(Text, { style: "auth-modal-close-label", children: "Cancel" })
      ] }) }),
      /* @__PURE__ */ jsxs(View, { style: "auth-modal-card", children: [
        /* @__PURE__ */ jsx(Text, { style: "auth-modal-title", children: "Sign in" }),
        /* @__PURE__ */ jsx(Text, { style: "auth-modal-subtitle", children: `Please log in or register ${actionPhrase}` }),
        /* @__PURE__ */ jsxs(View, { style: "auth-modal-primary-btn", children: [
          /* @__PURE__ */ jsx(Behavior, { href: `${baseUrl}/hyperview/login` }),
          /* @__PURE__ */ jsx(Text, { style: "auth-modal-primary-label", children: "Log in" })
        ] }),
        /* @__PURE__ */ jsxs(View, { style: "auth-modal-secondary-btn", children: [
          /* @__PURE__ */ jsx(Behavior, { href: `${baseUrl}/hyperview/accounts` }),
          /* @__PURE__ */ jsx(Text, { style: "auth-modal-secondary-label", children: "Create account" })
        ] })
      ] })
    ] })
  ] }) });
};
var AuthModal_default = AuthModal;
const modalStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "auth-modal-body",
      flex: 1,
      backgroundColor: "#fbfaf7",
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 64,
      paddingBottom: 32
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "auth-modal-top", flexDirection: "row", justifyContent: "flex-end" }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "auth-modal-close-hit",
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 12,
      paddingRight: 12
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "auth-modal-close-label",
      fontSize: 16,
      color: "#45413a",
      fontWeight: "600"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "auth-modal-card",
      backgroundColor: "#fbfaf7",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#e4e0d5",
      padding: 24,
      marginTop: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "auth-modal-title",
      fontFamily: "Fraunces-SemiBold",
      fontSize: 22,
      color: "#191613",
      marginBottom: 10
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "auth-modal-subtitle",
      fontSize: 15,
      color: "#45413a",
      lineHeight: 22,
      marginBottom: 28
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "auth-modal-primary-btn",
      backgroundColor: "#191613",
      borderRadius: 0,
      paddingTop: 16,
      paddingBottom: 16,
      alignItems: "center",
      marginBottom: 12
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "auth-modal-primary-label",
      color: "#fbfaf7",
      fontWeight: "600",
      fontSize: 16
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "auth-modal-secondary-btn",
      borderWidth: 1,
      borderColor: "#a39d90",
      borderRadius: 0,
      paddingTop: 16,
      paddingBottom: 16,
      alignItems: "center",
      backgroundColor: "#fbfaf7"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "auth-modal-secondary-label",
      color: "#191613",
      fontWeight: "600",
      fontSize: 16
    }
  )
] });
export {
  AuthModal_default as default
};
