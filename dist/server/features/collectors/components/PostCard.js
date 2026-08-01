import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { getInitialsAvatar } from "../../../lib/avatar.js";
const authorName = (author) => [author.firstName, author.lastName].filter(Boolean).join(" ").trim() || "Collector";
const PostCard = ({ post, author }) => {
  const name = authorName(author);
  const avatarUrl = author.profileImageUrl ?? getInitialsAvatar(author.firstName ?? "", author.lastName ?? "");
  const header = /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2 min-w-0", children: [
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
  ] });
  return /* @__PURE__ */ jsxs("article", { class: "rounded-radius border border-outline bg-surface p-4 shadow-sm", children: [
    /* @__PURE__ */ jsxs("header", { class: "mb-3 flex items-center justify-between gap-3", children: [
      author.shelfSlug ? /* @__PURE__ */ jsx("a", { href: `/shelf/${author.shelfSlug}`, children: header }) : header,
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
    ) })
  ] });
};
var PostCard_default = PostCard;
export {
  PostCard_default as default
};
