import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Image, Style, Text, View } from "../../../../lib/hxml-comps.js";
import { xmlText } from "../../../../lib/hxml.js";
const SpotlightShare = ({
  baseUrl,
  shareUrl,
  shareTitle,
  shareMessage,
  shareImage
}) => /* @__PURE__ */ jsx(View, { style: "spotlight-share-row", children: /* @__PURE__ */ jsxs(View, { style: "spotlight-share-block", children: [
  /* @__PURE__ */ jsx(
    Image,
    {
      source: `${baseUrl}/icons/share.png`,
      style: "book-action-icon",
      "resize-mode": "contain"
    }
  ),
  /* @__PURE__ */ jsx(Text, { style: "book-action-label", children: "Share" }),
  /* @__PURE__ */ jsx(
    Behavior,
    {
      action: "share",
      href: shareUrl,
      "share-url": xmlText(shareUrl),
      "share-message": xmlText(shareMessage),
      "share-title": xmlText(shareTitle),
      ...shareImage ? { "share-image": xmlText(shareImage) } : {}
    }
  )
] }) });
var SpotlightShare_default = SpotlightShare;
const spotlightShareStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-share-row",
      alignItems: "center",
      marginTop: 8,
      marginBottom: 16
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-share-block",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingTop: 12,
      paddingBottom: 12,
      paddingLeft: 16,
      paddingRight: 16,
      borderRadius: 0,
      backgroundColor: "#fbfaf7",
      borderWidth: 1,
      borderColor: "#e4e0d5"
    }
  )
] });
export {
  SpotlightShare_default as default,
  spotlightShareStyles
};
