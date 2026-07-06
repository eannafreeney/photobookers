import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Style, Text, View } from "../../../lib/hxml-comps.js";
const SectionHeader = ({ title, viewAllHref }) => /* @__PURE__ */ jsxs(View, { style: "section-header", children: [
  /* @__PURE__ */ jsx(Text, { style: "section-header-title", children: title }),
  viewAllHref && /* @__PURE__ */ jsxs(View, { style: "section-header-view-all", children: [
    /* @__PURE__ */ jsx(Text, { style: "section-header-view-all-label", children: "VIEW ALL \u2192" }),
    /* @__PURE__ */ jsx(Behavior, { href: viewAllHref })
  ] })
] });
var SectionHeader_default = SectionHeader;
const sectionHeaderStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "section-header",
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      marginBottom: 12,
      marginTop: 8,
      paddingTop: 10,
      borderTopWidth: 2,
      borderTopColor: "#191613"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "section-header-title",
      fontFamily: "Fraunces",
      fontWeight: "500",
      fontSize: 20,
      lineHeight: 24,
      color: "#191613",
      flexShrink: 1
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "section-header-view-all",
      paddingTop: 4,
      paddingBottom: 4,
      paddingLeft: 8,
      paddingRight: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "section-header-view-all-label",
      fontSize: 11,
      letterSpacing: 1,
      color: "#a22c29",
      fontWeight: "600"
    }
  )
] });
export {
  SectionHeader_default as default,
  sectionHeaderStyles
};
