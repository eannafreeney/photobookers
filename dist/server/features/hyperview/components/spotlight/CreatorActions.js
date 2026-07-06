import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Image, Text, View } from "../../../../lib/hxml-comps.js";
import { Style } from "../../../../lib/hxml-comps.js";
import FollowButton from "../FollowButton.js";
import { xmlText } from "../../../../lib/hxml.js";
import { aotwPath, potwPath } from "../../../app/spotlightUrls.js";
import { capitalize } from "../../../../utils.js";
const CreatorActions = ({
  creator,
  baseUrl,
  isFollowing,
  weekStart,
  coverImage
}) => {
  const role = capitalize(creator.type);
  const title = `${role} of the Week`;
  const sharePath = creator.type === "artist" ? aotwPath(weekStart) : potwPath(weekStart);
  const shareUrl = `${baseUrl}${sharePath}`;
  return /* @__PURE__ */ jsxs(View, { style: "book-actions-row", children: [
    /* @__PURE__ */ jsx(View, { style: "book-action-cell", children: /* @__PURE__ */ jsx(
      FollowButton,
      {
        creatorId: creator.id,
        baseUrl,
        isActive: isFollowing
      }
    ) }),
    /* @__PURE__ */ jsx(View, { style: "book-action-cell", children: /* @__PURE__ */ jsxs(View, { style: "book-action-block", children: [
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
          "share-message": xmlText(
            `Check out ${creator.displayName} on Photobookers`
          ),
          "share-title": xmlText(`${title} \u2014 ${creator.displayName}`),
          ...coverImage ? { "share-image": xmlText(coverImage) } : {}
        }
      )
    ] }) })
  ] });
};
var CreatorActions_default = CreatorActions;
const creatorActionsStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-actions-row",
      flexDirection: "row",
      alignItems: "stretch",
      gap: 8
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "book-action-cell", flex: 1 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-action-block",
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
      borderColor: "#e4e0d5",
      width: "100%",
      children: /* @__PURE__ */ jsx("modifier", {})
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-btn",
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "#e4e0d5",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "book-action-icon", width: 18, height: 18 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-action-label",
      fontSize: 14,
      fontWeight: "600",
      color: "#191613"
    }
  )
] });
export {
  creatorActionsStyles,
  CreatorActions_default as default
};
