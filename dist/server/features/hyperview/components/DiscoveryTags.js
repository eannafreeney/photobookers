import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, View, Text, Style } from "../../../lib/hxml-comps.js";
import { hyperviewTagBooksUrl } from "../../../lib/tags.js";
const DiscoveryTags = ({ baseUrl, tags }) => {
  return /* @__PURE__ */ jsx(View, { style: "discover-tags-section", children: /* @__PURE__ */ jsx(View, { style: "discover-tags-wrap", children: tags.map((tag) => /* @__PURE__ */ jsxs(View, { style: "discover-tag-pill", children: [
    /* @__PURE__ */ jsx(Behavior, { href: hyperviewTagBooksUrl(baseUrl, tag) }),
    /* @__PURE__ */ jsx(Text, { style: "discover-tag-label", children: tag.toUpperCase() })
  ] }, tag)) }) });
};
var DiscoveryTags_default = DiscoveryTags;
const discoveryTagStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "discover-tags-section",
      flexDirection: "column",
      marginTop: 8,
      marginBottom: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "discover-tags-wrap",
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "discover-tag-pill",
      borderWidth: 1,
      borderColor: "#191613",
      borderRadius: 999,
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 14,
      paddingRight: 14,
      backgroundColor: "#fbfaf7",
      marginRight: 8,
      marginBottom: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "discover-tag-label",
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 1,
      color: "#191613"
    }
  )
] });
export {
  DiscoveryTags_default as default,
  discoveryTagStyles
};
