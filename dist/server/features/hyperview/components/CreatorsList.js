import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  Behavior,
  Image,
  Spinner,
  Style,
  Text,
  View
} from "../../../lib/hxml-comps.js";
import FollowButton from "./FollowButton.js";
import VerificationBadge, {
  verificationBadgeStyles
} from "./VerificationBadge.js";
const CREATORS_LOAD_MORE_ID = "creators-load-more";
const CreatorsList = ({
  creators,
  baseUrl,
  page,
  hasMore,
  loadMoreHref
}) => {
  if (creators.length === 0) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    creators.map((creator) => {
      const isVerified = creator.status === "verified";
      return /* @__PURE__ */ jsxs(View, { style: "creators-list-row", children: [
        /* @__PURE__ */ jsx(
          Behavior,
          {
            href: `${baseUrl}/hyperview/creators/${creator.id}/tab/books`
          }
        ),
        /* @__PURE__ */ jsxs(View, { style: "creators-list-avatar-wrap", children: [
          creator.coverUrl ? /* @__PURE__ */ jsx(
            Image,
            {
              source: creator.coverUrl,
              style: "creators-list-avatar",
              "resize-mode": "cover"
            }
          ) : /* @__PURE__ */ jsx(View, { style: "creators-list-avatar-placeholder" }),
          isVerified ? /* @__PURE__ */ jsx(View, { style: "creators-list-avatar-badge", children: /* @__PURE__ */ jsx(
            VerificationBadge,
            {
              isVerified,
              baseUrl
            }
          ) }) : null
        ] }),
        /* @__PURE__ */ jsx(View, { style: "creators-list-main", children: /* @__PURE__ */ jsxs(View, { style: "creators-list-info", children: [
          /* @__PURE__ */ jsx(Text, { style: "creators-list-name", children: creator.displayName }),
          /* @__PURE__ */ jsx(Text, { style: "creators-list-type", children: creator.type })
        ] }) }),
        /* @__PURE__ */ jsx(
          FollowButton,
          {
            creatorId: creator.id,
            baseUrl,
            isActive: false
          }
        )
      ] });
    }),
    hasMore && loadMoreHref ? /* @__PURE__ */ jsx(
      "view",
      {
        id: CREATORS_LOAD_MORE_ID,
        style: "creators-list-spinner",
        trigger: "visible",
        once: "true",
        verb: "get",
        href: `${loadMoreHref}?page=${page + 1}`,
        action: "replace",
        children: /* @__PURE__ */ jsx(Spinner, {})
      }
    ) : null
  ] });
};
var CreatorsList_default = CreatorsList;
const CreatorsListMessage = ({ children }) => /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", style: "tab-fragment", children });
const creatorsListStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creators-list-row",
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 12,
      paddingBottom: 12,
      paddingLeft: 16,
      paddingRight: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#e4e0d5"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creators-list-main",
      flexDirection: "row",
      marginLeft: 8,
      alignItems: "center",
      flex: 1
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "creators-list-info", flexDirection: "column", flex: 1 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creators-list-avatar-wrap",
      width: 48,
      height: 48,
      position: "relative"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creators-list-avatar-badge",
      position: "absolute",
      top: -4,
      right: -4,
      zIndex: 1
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creators-list-name",
      fontSize: 15,
      fontWeight: "600",
      color: "#191613"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creators-list-type",
      fontSize: 12,
      color: "#45413a",
      marginTop: 2,
      textTransform: "uppercase"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "creators-list-avatar", width: 48, height: 48, borderRadius: 24 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creators-list-avatar-placeholder",
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#e4e0d5"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creators-list-spinner",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 16,
      paddingBottom: 16
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
  verificationBadgeStyles()
] });
export {
  CREATORS_LOAD_MORE_ID,
  CreatorsListMessage,
  creatorsListStyles,
  CreatorsList_default as default
};
