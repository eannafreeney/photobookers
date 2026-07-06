import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { truncate } from "../../../lib/utils.js";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps.js";
import VerificationBadge from "./VerificationBadge.js";
const CreatorCircle = ({ creator, baseUrl }) => {
  const isVerified = creator.status === "verified";
  return /* @__PURE__ */ jsxs(View, { style: "trending-creator-circle", children: [
    /* @__PURE__ */ jsx(
      Behavior,
      {
        href: `${baseUrl}/hyperview/creators/${creator.id}/tab/books`
      }
    ),
    /* @__PURE__ */ jsxs(View, { style: "trending-creator-avatar-wrap", children: [
      creator.coverUrl ? /* @__PURE__ */ jsx(
        Image,
        {
          source: creator.coverUrl,
          style: "trending-creator-avatar",
          "resize-mode": "cover"
        }
      ) : /* @__PURE__ */ jsx(View, { style: "trending-creator-avatar-placeholder" }),
      isVerified ? /* @__PURE__ */ jsx(View, { style: "trending-creator-avatar-badge", children: /* @__PURE__ */ jsx(VerificationBadge, { isVerified, baseUrl }) }) : null
    ] }),
    /* @__PURE__ */ jsx(Text, { style: "trending-creator-name", "number-of-lines": 2, children: truncate(creator.displayName ?? "", 20) })
  ] });
};
var CreatorCirle_default = CreatorCircle;
const creatorCircleStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "trending-creator-circle",
      width: 96,
      marginRight: 12,
      flexDirection: "column",
      alignItems: "center",
      gap: 12
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "trending-creator-avatar-wrap",
      width: 96,
      height: 96,
      position: "relative"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "trending-creator-avatar",
      width: 96,
      height: 96,
      borderRadius: 48
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "trending-creator-avatar-placeholder",
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: "#e4e0d5"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "trending-creator-avatar-badge",
      position: "absolute",
      top: -1,
      right: -1
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "trending-creator-name",
      fontSize: 14,
      fontWeight: "500",
      color: "#191613",
      textAlign: "center"
    }
  )
] });
export {
  creatorCircleStyles,
  CreatorCirle_default as default
};
