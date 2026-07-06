import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Style, Text, View } from "../../../lib/hxml-comps.js";
const LegalText = ({ sections }) => /* @__PURE__ */ jsx(View, { style: "legal-text", children: sections.map((section, index) => /* @__PURE__ */ jsx(Text, { style: "legal-section", children: section }, index)) });
var LegalText_default = LegalText;
const legalTextStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "legal-text",
      flexDirection: "column",
      paddingTop: 8,
      paddingBottom: 24
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "legal-section",
      fontSize: 14,
      color: "#45413a",
      lineHeight: 22,
      marginBottom: 16
    }
  )
] });
export {
  LegalText_default as default,
  legalTextStyles
};
