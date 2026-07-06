import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps.js";
import HeaderIconButton, { headerIconButtonStyles } from "./HeaderIconButton.js";
import VerificationBadge, {
  verificationBadgeStyles
} from "./VerificationBadge.js";
const CustomHeader = ({
  title,
  artist,
  publisher,
  showBackButton,
  isVerified,
  coverUrl,
  isSearch,
  baseUrl,
  searchToggleTarget,
  searchScrollToTopTarget,
  showClaimButton = false,
  claimHref
}) => /* @__PURE__ */ jsx(View, { style: "custom-header-safe", "safe-area": "true", children: /* @__PURE__ */ jsxs(View, { style: "custom-header", children: [
  showBackButton ? /* @__PURE__ */ jsxs(View, { style: "custom-header-back", children: [
    /* @__PURE__ */ jsx(Behavior, { action: "back" }),
    /* @__PURE__ */ jsx(Text, { style: "back-btn", children: "\u2190" })
  ] }) : null,
  /* @__PURE__ */ jsxs(View, { style: "header-title-container", children: [
    coverUrl ? /* @__PURE__ */ jsx(Image, { source: coverUrl, style: "header-cover", "resize-mode": "cover" }) : null,
    /* @__PURE__ */ jsxs(View, { style: "header-title-container-inner", children: [
      /* @__PURE__ */ jsxs(View, { style: "header-title-row", children: [
        /* @__PURE__ */ jsx(Text, { style: artist ? "header-title-artist" : "header-title", children: title }),
        /* @__PURE__ */ jsx(VerificationBadge, { isVerified, baseUrl })
      ] }),
      artist ? /* @__PURE__ */ jsxs(Text, { style: "header-artist", children: [
        `by ${artist}`,
        publisher && ` \u2014 ${publisher}`
      ] }) : null
    ] })
  ] }),
  /* @__PURE__ */ jsxs(View, { style: "header-actions", children: [
    showClaimButton && claimHref ? /* @__PURE__ */ jsxs(View, { style: "header-claim-btn", children: [
      /* @__PURE__ */ jsx(Text, { style: "header-claim-label", children: "Is this you?" }),
      /* @__PURE__ */ jsx(Behavior, { action: "deep-link", href: claimHref })
    ] }) : null,
    isSearch && baseUrl ? searchToggleTarget ? /* @__PURE__ */ jsx(
      HeaderIconButton,
      {
        icon: `${baseUrl}/icons/header/search-dark.png`,
        action: "toggle",
        target: searchToggleTarget,
        scrollToTopTarget: searchScrollToTopTarget
      }
    ) : /* @__PURE__ */ jsx(
      HeaderIconButton,
      {
        href: `${baseUrl}/hyperview/search`,
        icon: `${baseUrl}/icons/header/search-dark.png`
      }
    ) : null
  ] })
] }) });
var CustomHeader_default = CustomHeader;
const customHeaderStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "custom-header-safe",
      backgroundColor: "#fbfaf7",
      borderBottomWidth: 1,
      borderBottomColor: "#e4e0d5"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "custom-header",
      paddingTop: 12,
      paddingBottom: 12,
      paddingLeft: 16,
      paddingRight: 16,
      flexDirection: "row",
      alignItems: "center",
      minHeight: 64
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "header-cover",
      width: 40,
      height: 40,
      borderRadius: 0,
      overflow: "hidden"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "header-title-container",
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 16
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "header-title-container-inner", flexDirection: "column", gap: 2 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "header-title-row",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      flexShrink: 1
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "header-title",
      fontFamily: "Fraunces-SemiBold",
      fontSize: 19,
      color: "#191613",
      lineHeight: 24
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "header-title-artist",
      fontFamily: "Fraunces-SemiBold",
      fontSize: 17,
      color: "#191613",
      lineHeight: 22
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "header-artist", fontSize: 12, color: "#45413a", lineHeight: 14 }),
  /* @__PURE__ */ jsx(Style, { id: "custom-header-back", flexDirection: "row", alignItems: "center" }),
  /* @__PURE__ */ jsx(Style, { id: "back-btn", fontSize: 16, color: "#a22c29", marginRight: 12 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "header-actions",
      flexDirection: "row",
      alignItems: "center",
      gap: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "header-claim-btn",
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 10,
      paddingRight: 10,
      borderRadius: 0,
      borderWidth: 1,
      borderColor: "#191613",
      backgroundColor: "#fbfaf7",
      alignItems: "center",
      justifyContent: "center"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "header-claim-label",
      fontSize: 12,
      fontWeight: "600",
      color: "#191613"
    }
  ),
  headerIconButtonStyles(),
  verificationBadgeStyles()
] });
export {
  customHeaderStyles,
  CustomHeader_default as default
};
