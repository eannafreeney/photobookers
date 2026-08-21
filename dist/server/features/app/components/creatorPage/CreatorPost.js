import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Badge from "../../../../components/app/Badge.js";
import { postPath, postShareText } from "../../../../lib/share.js";
import ShareButton from "../../../api/components/ShareButton.js";
import PostLikeButton from "../../../collectors/components/PostLikeButton.js";
const CreatorPost = ({
  creator,
  post,
  canReadPosts = true,
  likeCount = 0,
  likedByMe = false
}) => {
  const redactClass = !canReadPosts ? "select-none blur-[3px] pointer-events-none" : "";
  const shareUrl = postPath(post.id);
  return /* @__PURE__ */ jsxs("article", { class: "rounded-radius border border-outline bg-surface p-4 shadow-sm", children: [
    /* @__PURE__ */ jsxs("header", { class: "mb-3 flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { class: "flex min-w-0 items-center gap-2", children: [
        /* @__PURE__ */ jsx("a", { href: `/creators/${creator.slug}`, class: "min-w-0", children: /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2 min-w-0", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: creator.coverUrl ?? "",
              alt: creator.displayName,
              class: "size-8 rounded-full object-cover"
            }
          ),
          /* @__PURE__ */ jsx("span", { class: "truncate text-sm font-medium text-on-surface-strong", children: creator.displayName })
        ] }) }),
        /* @__PURE__ */ jsx(Badge, { variant: "accent", children: "Creator" })
      ] }),
      /* @__PURE__ */ jsx("time", { class: "shrink-0 text-xs text-on-surface", children: post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "" })
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "relative", children: [
      /* @__PURE__ */ jsxs("div", { class: redactClass, children: [
        /* @__PURE__ */ jsx("p", { class: "whitespace-pre-wrap text-sm text-on-surface", children: post.body }),
        post.imageUrl && /* @__PURE__ */ jsx("div", { class: "mt-3", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: post.imageUrl,
            alt: "Post image",
            class: "w-full rounded-radius object-cover border border-outline",
            loading: "lazy"
          }
        ) })
      ] }),
      !canReadPosts && /* @__PURE__ */ jsx("div", { class: "absolute inset-0 grid place-items-center", children: /* @__PURE__ */ jsx("div", { class: "rounded-full border border-outline bg-surface/90 px-3 py-1 text-xs font-medium text-on-surface-strong shadow-sm", children: "Follow to unlock" }) })
    ] }),
    canReadPosts ? /* @__PURE__ */ jsxs("div", { class: "mt-3 flex items-center gap-1", children: [
      /* @__PURE__ */ jsx(
        PostLikeButton,
        {
          postId: post.id,
          likedByMe,
          likeCount
        }
      ),
      /* @__PURE__ */ jsx(
        ShareButton,
        {
          variant: "inline",
          title: `Post by ${creator.displayName}`,
          text: postShareText(creator.displayName),
          url: shareUrl,
          imageUrl: post.imageUrl ?? creator.coverUrl ?? void 0
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: postPath(post.id),
          class: "ml-auto text-xs text-on-surface-weak hover:text-on-surface-strong hover:underline",
          children: "Open post"
        }
      )
    ] }) : null
  ] });
};
var CreatorPost_default = CreatorPost;
export {
  CreatorPost_default as default
};
