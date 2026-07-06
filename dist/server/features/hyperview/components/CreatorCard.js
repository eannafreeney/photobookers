import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps.js";
import { creatorSocialStyles } from "./CreatorSocialLinks.js";
import FollowButton from "./FollowButton.js";
import { formatCountry } from "../../../lib/utils.js";
const CreatorCard = ({
  creator,
  baseUrl = "",
  title,
  showHeader = true,
  isFollowing = false,
  profileHref
}) => {
  if (!creator) return /* @__PURE__ */ jsx(Fragment, {});
  const creatorProfileHref = profileHref ?? `${baseUrl}/hyperview/creators/${creator.id}/tab/books`;
  const location = [creator.city, formatCountry(creator.country ?? "")].filter(Boolean).join(", ");
  return /* @__PURE__ */ jsxs(View, { style: "creator-card", children: [
    showHeader && /* @__PURE__ */ jsxs(View, { style: "creator-card-header", children: [
      /* @__PURE__ */ jsx(Behavior, { href: creatorProfileHref }),
      /* @__PURE__ */ jsxs(View, { style: "creator-card-header-creator", children: [
        creator.coverUrl && /* @__PURE__ */ jsx(
          Image,
          {
            source: creator.coverUrl,
            style: "creator-card-header-avatar"
          }
        ),
        creator.displayName && /* @__PURE__ */ jsx(Text, { style: "creator-card-header-artist", children: creator.displayName })
      ] }),
      title && /* @__PURE__ */ jsx(Text, { style: "creator-card-header-title", children: title })
    ] }),
    /* @__PURE__ */ jsx(Behavior, { href: creatorProfileHref }),
    creator.coverUrl && /* @__PURE__ */ jsx(
      Image,
      {
        source: creator.coverUrl,
        style: "creator-cover",
        "resize-mode": "cover"
      }
    ),
    /* @__PURE__ */ jsx(View, { style: "creator-body", children: /* @__PURE__ */ jsxs(View, { style: "creator-body-top", children: [
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
    ] }) })
  ] });
};
var CreatorCard_default = CreatorCard;
const creatorCardStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creator-card",
      flexDirection: "column",
      marginBottom: 16,
      backgroundColor: "#fbfaf7",
      borderWidth: 1,
      borderColor: "#e4e0d5",
      overflow: "hidden"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "creator-cover", width: "100%", height: 300 }),
  /* @__PURE__ */ jsx(Style, { id: "creator-body", padding: 12, flexDirection: "column", gap: 4 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creator-body-top",
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 4
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "creator-body-left", width: "60%" }),
  /* @__PURE__ */ jsx(Style, { id: "creator-body-right", width: "40%" }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creator-body-footer",
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
  creatorSocialStyles(),
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
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creator-card-header",
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 12,
      paddingRight: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      height: 40
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creator-card-header-creator",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flex: 1
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creator-card-header-avatar",
      width: 24,
      height: 24,
      borderRadius: 12,
      overflow: "hidden"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "creator-card-header-artist", fontSize: 13, color: "#45413a" }),
  /* @__PURE__ */ jsx(Style, { id: "creator-card-header-title", fontSize: 12, color: "#a39d90" })
] });
export {
  creatorCardStyles,
  CreatorCard_default as default
};
