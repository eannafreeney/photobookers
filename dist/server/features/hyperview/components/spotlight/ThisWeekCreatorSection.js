import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Image, Style, Text, View } from "../../../../lib/hxml-comps.js";
import SectionHeader from "../SectionHeader.js";
import { capitalize } from "../../../../utils.js";
const ThisWeekCreatorSection = ({ spotlight, spotlightHref }) => {
  const { creator } = spotlight;
  const role = capitalize(creator.type);
  const title = `${role} of the Week`;
  const image = spotlight.instagramImageUrl ?? creator.coverUrl ?? creator.bannerUrl;
  return /* @__PURE__ */ jsxs(View, { style: "spotlight-creator-section", children: [
    /* @__PURE__ */ jsx(SectionHeader, { title }),
    image ? /* @__PURE__ */ jsx(Image, { source: image, style: "spotlight-cover", "resize-mode": "cover" }) : null,
    /* @__PURE__ */ jsx(Text, { style: "spotlight-body-text", children: creator.displayName }),
    /* @__PURE__ */ jsxs(View, { style: "spotlight-profile-btn", children: [
      /* @__PURE__ */ jsx(Text, { style: "spotlight-profile-btn-label", children: "View" }),
      /* @__PURE__ */ jsx(Behavior, { href: spotlightHref })
    ] })
  ] });
};
var ThisWeekCreatorSection_default = ThisWeekCreatorSection;
const thisWeekCreatorSectionStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-creator-section",
      borderBottomWidth: 1,
      borderBottomColor: "#e4e0d5",
      paddingBottom: 16,
      marginBottom: 16,
      gap: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-cover",
      width: "100%",
      height: 280,
      borderRadius: 0,
      marginBottom: 16
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-body-text",
      fontSize: 18,
      fontWeight: "700",
      color: "#191613",
      lineHeight: 20
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-profile-btn",
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
      id: "spotlight-profile-btn-label",
      fontSize: 14,
      fontWeight: "600",
      color: "#191613"
    }
  )
] });
export {
  ThisWeekCreatorSection_default as default,
  thisWeekCreatorSectionStyles
};
