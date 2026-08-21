import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { formatDate } from "../../../utils.js";
import { listPosts } from "../../../db/queries.js";
import { getPostLikeStats } from "../../../domain/posts/likes.js";
import EditRowButton from "../../app/components/EditRowButton.js";
import DeleteRowButton from "../../app/components/DeleteRowButton.js";
const alpineAttrs = {
  "x-init": "true",
  "@posts:updated.window": "$ajax('/dashboard/posts', { target: 'posts-table-container' })"
};
const PostsTable = async ({ userId, isMobile = false }) => {
  const posts = await listPosts(userId);
  const likeStats = await getPostLikeStats(posts.map((post) => post.id));
  if (posts.length === 0) {
    return /* @__PURE__ */ jsx("div", { "x-data": true, id: "posts-table-container", ...alpineAttrs, children: /* @__PURE__ */ jsx("div", { class: "rounded border border-outline bg-surface-alt p-6 text-sm text-on-surface", children: /* @__PURE__ */ jsx("p", { children: "No posts yet. Publish your first post." }) }) });
  }
  if (isMobile) {
    return /* @__PURE__ */ jsx(
      "ul",
      {
        "x-data": true,
        id: "posts-table-container",
        class: "flex flex-col gap-4",
        ...alpineAttrs,
        children: posts.map((post) => /* @__PURE__ */ jsx(
          PostListCard,
          {
            post,
            likeCount: likeStats.get(post.id)?.likeCount ?? 0
          }
        ))
      }
    );
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      "x-data": true,
      id: "posts-table-container",
      class: "overflow-x-auto border border-outline",
      ...alpineAttrs,
      children: /* @__PURE__ */ jsxs("table", { class: "w-full text-left text-sm", children: [
        /* @__PURE__ */ jsx("thead", { class: "border-b border-outline bg-surface-alt kicker text-on-surface-weak", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { class: "px-4 py-3 font-medium", children: "Date" }),
          /* @__PURE__ */ jsx("th", { class: "px-4 py-3 font-medium", children: "Image" }),
          /* @__PURE__ */ jsx("th", { class: "px-4 py-3 font-medium", children: "Body" }),
          /* @__PURE__ */ jsx("th", { class: "px-4 py-3 font-medium", children: "Likes" }),
          /* @__PURE__ */ jsx("th", { class: "px-4 py-3 font-medium" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: posts.map((post) => /* @__PURE__ */ jsx(
          PostListRow,
          {
            post,
            likeCount: likeStats.get(post.id)?.likeCount ?? 0
          }
        )) })
      ] })
    }
  );
};
const postDateLabel = (post) => post.createdAt ? formatDate(new Date(post.createdAt)) : "\u2014";
const postExcerpt = (body) => body.length > 100 ? body.slice(0, 100) + "..." : body;
const PostListCard = ({
  post,
  likeCount
}) => {
  const editHref = `/dashboard/posts/${post.id}`;
  return /* @__PURE__ */ jsx("li", { class: "rounded-radius border border-outline bg-surface overflow-hidden", children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4 p-4", children: [
    /* @__PURE__ */ jsxs("div", { class: "flex gap-3", children: [
      post.imageUrl ? /* @__PURE__ */ jsx(
        "img",
        {
          src: post.imageUrl,
          alt: "Post image",
          class: "h-20 w-14 shrink-0 object-cover rounded-sm"
        }
      ) : null,
      /* @__PURE__ */ jsxs("div", { class: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface-weak", children: postDateLabel(post) }),
        /* @__PURE__ */ jsx("p", { class: "mt-1 text-sm text-on-surface line-clamp-3", children: postExcerpt(post.body) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("dl", { class: "grid grid-cols-[5.5rem_1fr] items-center gap-x-3 gap-y-3 text-sm", children: [
      /* @__PURE__ */ jsx("dt", { class: "text-on-surface-weak", children: "Likes" }),
      /* @__PURE__ */ jsx("dd", { class: "tabular-nums", children: likeCount })
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "flex flex-wrap justify-evenly items-center gap-2 border-t border-outline pt-3", children: [
      /* @__PURE__ */ jsx(EditRowButton, { href: editHref, xTarget: "modal-root" }),
      /* @__PURE__ */ jsx(
        DeleteRowButton,
        {
          action: `/dashboard/posts/${post.id}`,
          confirm: "Delete this post?"
        }
      )
    ] })
  ] }) });
};
const PostListRow = ({
  post,
  likeCount
}) => {
  const editHref = `/dashboard/posts/${post.id}`;
  return /* @__PURE__ */ jsxs("tr", { class: "border-b border-outline last:border-0", children: [
    /* @__PURE__ */ jsx("td", { class: "px-4 py-3", children: postDateLabel(post) }),
    /* @__PURE__ */ jsx("td", { class: "px-4 py-3", children: post.imageUrl ? /* @__PURE__ */ jsx(
      "img",
      {
        src: post.imageUrl,
        alt: "Post image",
        class: "h-12 w-12 rounded-radius border border-outline object-cover"
      }
    ) : /* @__PURE__ */ jsx("span", { class: "text-on-surface-weak", children: "\u2014" }) }),
    /* @__PURE__ */ jsx("td", { class: "px-4 py-3", children: /* @__PURE__ */ jsx("span", { class: "text-on-surface-weak", children: postExcerpt(post.body) }) }),
    /* @__PURE__ */ jsx("td", { class: "px-4 py-3 tabular-nums", children: likeCount }),
    /* @__PURE__ */ jsx("td", { class: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-end gap-2", children: [
      /* @__PURE__ */ jsx(EditRowButton, { href: editHref, xTarget: "modal-root" }),
      /* @__PURE__ */ jsx(
        DeleteRowButton,
        {
          action: `/dashboard/posts/${post.id}`,
          confirm: "Delete this post?"
        }
      )
    ] }) })
  ] });
};
var PostsTable_default = PostsTable;
export {
  PostsTable_default as default
};
