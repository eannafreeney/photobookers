import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Style, Text, View } from "../../../lib/hxml-comps.js";
const PrimaryButtonLink = ({ label, href, isDisabled = false }) => /* @__PURE__ */ jsxs(
  View,
  {
    style: isDisabled ? "primary-button-link-disabled" : "primary-button-link",
    children: [
      /* @__PURE__ */ jsx(
        Text,
        {
          style: isDisabled ? "primary-button-link-label-disabled" : "primary-button-link-label",
          children: label
        }
      ),
      !isDisabled ? /* @__PURE__ */ jsx(Behavior, { href }) : null
    ]
  }
);
var PrimaryButtonLink_default = PrimaryButtonLink;
const primaryButtonLinkStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "primary-button-link",
      flex: 1,
      backgroundColor: "#191613",
      borderRadius: 0,
      padding: 12,
      alignItems: "center"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "primary-button-link-label",
      fontSize: 14,
      fontWeight: "600",
      color: "#fbfaf7"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "primary-button-link-disabled",
      flex: 1,
      borderWidth: 1,
      borderColor: "#e4e0d5",
      borderRadius: 0,
      padding: 12,
      alignItems: "center",
      backgroundColor: "#f2efe8"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "primary-button-link-label-disabled",
      fontSize: 14,
      fontWeight: "600",
      color: "#a39d90"
    }
  )
] });
export {
  PrimaryButtonLink_default as default,
  primaryButtonLinkStyles
};
