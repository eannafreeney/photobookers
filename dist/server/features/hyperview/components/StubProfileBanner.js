import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Style, Text, View } from "../../../lib/hxml-comps.js";
const StubProfileBanner = ({ displayName, claimHref, show }) => {
  if (!show) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsxs(View, { style: "stub-profile-banner", children: [
    /* @__PURE__ */ jsx(Text, { style: "stub-profile-banner-text", children: `This profile was created by the Photobookers community. Are you ${displayName}?` }),
    /* @__PURE__ */ jsxs(View, { style: "stub-profile-banner-link", children: [
      /* @__PURE__ */ jsx(Text, { style: "stub-profile-banner-cta", children: "Claim your profile" }),
      /* @__PURE__ */ jsx(Behavior, { action: "deep-link", href: claimHref })
    ] })
  ] });
};
var StubProfileBanner_default = StubProfileBanner;
const stubProfileBannerStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "stub-profile-banner",
      backgroundColor: "#eef4fc",
      borderRadius: 8,
      padding: 12,
      marginBottom: 12
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "stub-profile-banner-text",
      fontSize: 13,
      color: "#45413a",
      lineHeight: 20,
      marginBottom: 8
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "stub-profile-banner-link", alignSelf: "flex-start" }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "stub-profile-banner-cta",
      fontSize: 14,
      fontWeight: "600",
      color: "#2563eb"
    }
  )
] });
export {
  StubProfileBanner_default as default,
  stubProfileBannerStyles
};
