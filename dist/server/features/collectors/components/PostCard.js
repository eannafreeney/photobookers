import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { getInitialsAvatar } from "../../../lib/avatar.js";
import { postPath, postShareText } from "../../../lib/share.js";
import ShareButton from "../../api/components/ShareButton.js";
import PostLikeButton from "./PostLikeButton.js";
const authorName = (author) => [author.firstName, author.lastName].filter(Boolean).join(" ").trim() || "Collector";
const PostCard = ({
  post,
  author,
  creator,
  likeCount = 0,
  likedByMe = false,
  showLike = true,
  showShare = true,
  showOpenLink = true
}) => {
  const name = creator?.displayName ?? authorName(author);
  const avatarUrl = creator ? creator.coverUrl ?? getInitialsAvatar(creator.displayName) : author.profileImageUrl ?? getInitialsAvatar(author.firstName ?? "", author.lastName ?? "");
  const href = creator ? `/creators/${creator.slug}` : author.shelfSlug ? `/shelf/${author.shelfSlug}` : null;
  const shareUrl = postPath(post.id);
  const header = /* @__PURE__ */ jsx("div", { class: "flex min-w-0 items-center gap-2", children: /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2 min-w-0", children: [
    /* @__PURE__ */ jsx(
      "img",
      {
        src: avatarUrl,
        alt: name,
        class: "size-8 rounded-full object-cover",
        loading: "lazy"
      }
    ),
    /* @__PURE__ */ jsx("span", { class: "truncate text-sm font-medium text-on-surface-strong", children: name })
  ] }) });
  return /* @__PURE__ */ jsxs("article", { class: "rounded-radius border border-outline bg-surface p-4 shadow-sm", children: [
    /* @__PURE__ */ jsxs("header", { class: "mb-3 flex items-center justify-between gap-3", children: [
      href ? /* @__PURE__ */ jsx("a", { href, children: header }) : header,
      /* @__PURE__ */ jsx("time", { class: "shrink-0 text-xs text-on-surface", children: post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "" })
    ] }),
    /* @__PURE__ */ jsx("p", { class: "whitespace-pre-wrap text-sm text-on-surface", children: post.body }),
    post.imageUrl && /* @__PURE__ */ jsx("div", { class: "mt-3", children: /* @__PURE__ */ jsx(
      "img",
      {
        src: post.imageUrl,
        alt: "Post image",
        class: "w-full rounded-radius object-cover border border-outline",
        loading: "lazy"
      }
    ) }),
    showLike || showShare ? /* @__PURE__ */ jsxs("div", { class: "mt-3 flex items-center gap-1", children: [
      showLike ? /* @__PURE__ */ jsx(
        PostLikeButton,
        {
          postId: post.id,
          likedByMe,
          likeCount
        }
      ) : null,
      showShare ? /* @__PURE__ */ jsx(
        ShareButton,
        {
          variant: "inline",
          title: `Post by ${name}`,
          text: postShareText(name),
          url: shareUrl,
          imageUrl: post.imageUrl ?? creator?.coverUrl ?? author.profileImageUrl ?? void 0
        }
      ) : null,
      showOpenLink ? /* @__PURE__ */ jsx(
        "a",
        {
          href: postPath(post.id),
          class: "ml-auto text-xs text-on-surface-weak hover:text-on-surface-strong hover:underline",
          children: "Open post"
        }
      ) : null
    ] }) : null
  ] });
};
var PostCard_default = PostCard;
export {
  PostCard_default as default
};
