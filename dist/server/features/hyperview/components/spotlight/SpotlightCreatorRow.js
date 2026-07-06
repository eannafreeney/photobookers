import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Image, Style, Text, View } from "../../../../lib/hxml-comps.js";
import FollowButton from "../FollowButton.js";
const SpotlightCreatorRow = ({
  creator,
  role,
  baseUrl,
  isFollowing
}) => {
  const profileHref = `${baseUrl}/hyperview/creators/${creator.id}/tab/books`;
  return /* @__PURE__ */ jsxs(View, { style: "spotlight-creator-row", children: [
    /* @__PURE__ */ jsx(Behavior, { href: profileHref }),
    creator.coverUrl ? /* @__PURE__ */ jsx(
      Image,
      {
        source: creator.coverUrl,
        style: "spotlight-creator-avatar",
        "resize-mode": "cover"
      }
    ) : /* @__PURE__ */ jsx(View, { style: "spotlight-creator-avatar" }),
    /* @__PURE__ */ jsxs(View, { style: "spotlight-creator-text", children: [
      /* @__PURE__ */ jsx(Text, { style: "spotlight-creator-role", children: role }),
      /* @__PURE__ */ jsx(Text, { style: "spotlight-creator-name", children: creator.displayName })
    ] }),
    /* @__PURE__ */ jsx(
      FollowButton,
      {
        creatorId: creator.id,
        baseUrl,
        isActive: isFollowing
      }
    )
  ] });
};
var SpotlightCreatorRow_default = SpotlightCreatorRow;
const spotlightCreatorRowStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-creator-row",
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      borderColor: "#e4e0d5",
      borderRadius: 0,
      padding: 12,
      gap: 12
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-creator-avatar",
      width: 48,
      height: 48,
      borderRadius: 24,
      flexShrink: 0
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-creator-text",
      flexDirection: "column",
      flex: 1,
      gap: 2
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "spotlight-creator-role", fontSize: 12, color: "#45413a" }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-creator-name",
      fontSize: 15,
      fontWeight: "600",
      color: "#191613"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "follow-btn",
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 16,
      paddingRight: 16,
      borderRadius: 0,
      backgroundColor: "#191613",
      alignItems: "center",
      flexShrink: 0
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "follow-label", fontSize: 14, fontWeight: "600", color: "#fbfaf7" })
] });
export {
  SpotlightCreatorRow_default as default,
  spotlightCreatorRowStyles
};
