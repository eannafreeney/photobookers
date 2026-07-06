import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Style, Text, View } from "../../../lib/hxml-comps.js";
const SecondaryButtonLink = ({
  label,
  href,
  isDisabled = false
}) => /* @__PURE__ */ jsxs(
  View,
  {
    style: isDisabled ? "secondary-button-link-disabled" : "secondary-button-link",
    children: [
      /* @__PURE__ */ jsx(
        Text,
        {
          style: isDisabled ? "secondary-button-link-label-disabled" : "secondary-button-link-label",
          children: label
        }
      ),
      !isDisabled ? /* @__PURE__ */ jsx(Behavior, { href }) : null
    ]
  }
);
var SecondaryButtonLink_default = SecondaryButtonLink;
const secondaryButtonLinkStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "secondary-button-link",
      flex: 1,
      borderWidth: 1,
      borderColor: "#191613",
      borderRadius: 0,
      padding: 12,
      alignItems: "center"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "secondary-button-link-label",
      fontSize: 14,
      fontWeight: "600",
      color: "#191613"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "secondary-button-link-disabled",
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
      id: "secondary-button-link-label-disabled",
      fontSize: 14,
      fontWeight: "600",
      color: "#a39d90"
    }
  )
] });
export {
  SecondaryButtonLink_default as default,
  secondaryButtonLinkStyles
};
