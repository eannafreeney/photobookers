import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Image, Spinner, Style, Text, View } from "../../../lib/hxml-comps.js";
import { formatDate } from "../../../utils.js";
const CREATOR_POSTS_LOAD_MORE_ID = "creator-posts-load-more";
const CreatorPostsList = ({
  posts,
  creator,
  canReadMessages,
  page = 1,
  hasMore = false,
  loadMoreHref
}) => /* @__PURE__ */ jsxs(Fragment, { children: [
  posts.map((post) => /* @__PURE__ */ jsxs(View, { style: "creator-post-card", children: [
    /* @__PURE__ */ jsxs(View, { style: "creator-post-header", children: [
      creator.coverUrl ? /* @__PURE__ */ jsx(
        Image,
        {
          source: creator.coverUrl,
          style: "creator-post-avatar",
          "resize-mode": "cover"
        }
      ) : null,
      /* @__PURE__ */ jsxs(View, { style: "creator-post-header-text", children: [
        /* @__PURE__ */ jsx(Text, { style: "creator-post-author", children: creator.displayName }),
        post.createdAt ? /* @__PURE__ */ jsx(Text, { style: "creator-post-date", children: formatDate(post.createdAt) }) : null
      ] })
    ] }),
    canReadMessages ? /* @__PURE__ */ jsxs(Fragment, { children: [
      post.body ? /* @__PURE__ */ jsx(Text, { style: "creator-post-body", children: post.body }) : null,
      post.imageUrl ? /* @__PURE__ */ jsx(
        Image,
        {
          source: post.imageUrl,
          style: "creator-post-image",
          "resize-mode": "cover"
        }
      ) : null
    ] }) : /* @__PURE__ */ jsx(Text, { style: "creator-post-locked", children: "Follow to unlock" })
  ] }, post.id)),
  hasMore && loadMoreHref ? /* @__PURE__ */ jsx(
    "view",
    {
      id: CREATOR_POSTS_LOAD_MORE_ID,
      style: "creator-posts-spinner",
      trigger: "visible",
      once: "true",
      verb: "get",
      href: `${loadMoreHref}?page=${page + 1}`,
      action: "replace",
      children: /* @__PURE__ */ jsx(Spinner, {})
    }
  ) : null
] });
var CreatorPostsList_default = CreatorPostsList;
const creatorPostsListStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creator-post-card",
      paddingTop: 14,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: "#e4e0d5"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creator-post-header",
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creator-post-avatar",
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 8
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "creator-post-header-text", flex: 1 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creator-post-author",
      fontSize: 13,
      fontWeight: "600",
      color: "#191613"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "creator-post-date", fontSize: 11, color: "#a39d90", marginTop: 2 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creator-post-body",
      fontSize: 14,
      color: "#45413a",
      lineHeight: 20,
      marginBottom: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creator-post-image",
      width: "100%",
      height: 220,
      borderRadius: 8,
      marginBottom: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creator-post-locked",
      fontSize: 13,
      fontWeight: "600",
      color: "#a39d90",
      textAlign: "center",
      paddingTop: 12,
      paddingBottom: 12
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creator-posts-spinner",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 16,
      paddingBottom: 16
    }
  )
] });
export {
  CREATOR_POSTS_LOAD_MORE_ID,
  creatorPostsListStyles,
  CreatorPostsList_default as default
};
