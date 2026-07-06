import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Style, Text, View } from "../../../../lib/hxml-comps.js";
const SpotlightHeader = ({ title, subtitle }) => /* @__PURE__ */ jsxs(View, { style: "spotlight-header", children: [
  subtitle ? /* @__PURE__ */ jsx(Text, { style: "spotlight-header-subtitle", children: subtitle.toUpperCase() }) : null,
  /* @__PURE__ */ jsx(Text, { style: "spotlight-header-title", children: title })
] });
var SpotlightHeader_default = SpotlightHeader;
const spotlightHeaderStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-header",
      alignItems: "center",
      paddingBottom: 16,
      gap: 4
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-header-title",
      fontFamily: "Fraunces-SemiBold",
      fontSize: 22,
      color: "#191613",
      textAlign: "center"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-header-subtitle",
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 1.5,
      color: "#a22c29",
      textAlign: "center"
    }
  )
] });
export {
  SpotlightHeader_default as default,
  spotlightHeaderStyles
};
