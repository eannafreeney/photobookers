import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Image, Style, Text, View } from "../../../lib/hxml-comps.js";
import FollowButton from "./FollowButton.js";
import { formatCountry } from "../../../lib/utils.js";
import ExpandableBio, { expandableBioStyles } from "./spotlight/ExpandableBio.js";
const CreatorBanner = ({
  creator,
  baseUrl = "",
  isFollowing = false
}) => {
  if (!creator) return /* @__PURE__ */ jsx(Fragment, {});
  const location = [creator.city, formatCountry(creator.country ?? "")].filter(Boolean).join(", ");
  return /* @__PURE__ */ jsxs(View, { style: "creator-card", children: [
    (creator.bannerUrl || creator.coverUrl) && /* @__PURE__ */ jsx(
      Image,
      {
        source: creator.bannerUrl || creator.coverUrl || "",
        style: "creator-cover",
        "resize-mode": "cover"
      }
    ),
    /* @__PURE__ */ jsxs(View, { style: "creator-body", children: [
      /* @__PURE__ */ jsxs(View, { style: "creator-body-top", children: [
        /* @__PURE__ */ jsxs(View, { style: "creator-body-left", children: [
          /* @__PURE__ */ jsx(Text, { style: "creator-name", children: creator.displayName }),
          location && /* @__PURE__ */ jsx(Text, { style: "creator-location", children: location })
        ] }),
        /* @__PURE__ */ jsx(View, { style: "creator-body-right", children: creator.id && /* @__PURE__ */ jsx(
          FollowButton,
          {
            creatorId: creator.id,
            baseUrl,
            isActive: isFollowing
          }
        ) })
      ] }),
      creator.bio ? /* @__PURE__ */ jsx(View, { style: "creator-bio", children: /* @__PURE__ */ jsx(
        ExpandableBio,
        {
          bio: creator.bio,
          id: creator.id ?? creator.slug ?? creator.displayName,
          textStyle: "creator-bio-text",
          maxWords: 25
        }
      ) }) : /* @__PURE__ */ jsx(View, { style: "creator-body-bottom", children: creator.tagline && /* @__PURE__ */ jsx(Text, { style: "creator-tagline", children: creator.tagline }) })
    ] })
  ] });
};
var CreatorBanner_default = CreatorBanner;
const creatorBannerStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creator-card",
      flexDirection: "column",
      marginBottom: 16,
      backgroundColor: "#fbfaf7",
      overflow: "hidden"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "creator-cover", width: "100%", height: 300 }),
  /* @__PURE__ */ jsx(Style, { id: "creator-body", padding: 12, flexDirection: "column", gap: 16 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creator-body-top-wrap",
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 4
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creator-name",
      fontFamily: "Fraunces-Medium",
      fontSize: 17,
      color: "#191613",
      marginBottom: 4
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creator-location",
      fontSize: 13,
      color: "#45413a",
      marginBottom: 4
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creator-tagline",
      fontSize: 13,
      color: "#45413a",
      lineHeight: 18,
      marginBottom: 12
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "follow-btn",
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 20,
      paddingRight: 20,
      borderRadius: 0,
      backgroundColor: "#191613",
      alignItems: "center"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "follow-label", fontSize: 14, fontWeight: "600", color: "#fbfaf7" }),
  /* @__PURE__ */ jsx(Style, { id: "creator-bio", flexDirection: "column", gap: 16 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creator-bio-text",
      fontSize: 13,
      color: "#45413a",
      lineHeight: 20
    }
  ),
  expandableBioStyles()
] });
export {
  creatorBannerStyles,
  CreatorBanner_default as default
};
