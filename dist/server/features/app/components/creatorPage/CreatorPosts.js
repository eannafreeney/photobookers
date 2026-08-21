import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { findFollow } from "../../../../db/queries.js";
import { listPostsByCreatorSlug } from "../../../../domain/posts/services.js";
import { getPostLikeStats } from "../../../../domain/posts/likes.js";
import CreatorPost from "./CreatorPost.js";
import ListNavigation from "../ListNavigation.js";
const CreatorPosts = async ({ creatorSlug, user }) => {
  const [error, result] = await listPostsByCreatorSlug(creatorSlug, 1, 5);
  if (error || !result) return /* @__PURE__ */ jsx(Fragment, {});
  const { posts, totalPages, page, creator } = result;
  const isOwner = user?.creator?.id === creator.id;
  const canReadPosts = isOwner || user?.isAdmin || (user?.id ? Boolean(await findFollow(creator.id, user.id)) : false);
  const targetId = `creator-posts-${creator.id}`;
  const likeStats = await getPostLikeStats(
    posts.map((post) => post.id),
    user?.id
  );
  return /* @__PURE__ */ jsxs(
    "div",
    {
      id: targetId,
      class: "w-full flex flex-col gap-4",
      "x-data": true,
      ...{
        "@creator-posts:updated.window": `$ajax('/creators/${creator.slug}', { target: '${targetId}' })`
      },
      children: [
        posts.length === 0 ? /* @__PURE__ */ jsx("div", { class: "rounded-radius border border-outline bg-surface-alt p-6 text-sm text-on-surface", children: isOwner ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("p", { class: "font-medium text-on-surface-strong", children: "No posts yet" }),
          /* @__PURE__ */ jsx("p", { class: "mt-2 text-pretty", children: "Share fair dates, work-in-progress shots, or news with people who follow you." }),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "/dashboard/posts",
              class: "mt-4 inline-block text-sm font-medium text-accent hover:underline",
              children: "Write your first post \u2192"
            }
          )
        ] }) : canReadPosts ? /* @__PURE__ */ jsxs("p", { children: [
          "No posts yet. Check back soon for updates from",
          " ",
          creator.displayName,
          "."
        ] }) : /* @__PURE__ */ jsxs("p", { children: [
          "No posts yet. Follow ",
          creator.displayName,
          " to see updates here."
        ] }) }) : posts.map((post) => /* @__PURE__ */ jsx(
          CreatorPost,
          {
            creator,
            post,
            canReadPosts,
            likeCount: likeStats.get(post.id)?.likeCount ?? 0,
            likedByMe: likeStats.get(post.id)?.likedByMe ?? false
          }
        )),
        /* @__PURE__ */ jsx(
          ListNavigation,
          {
            targetId,
            totalPages,
            page,
            currentPath: `/creators/${creator.slug}`
          }
        )
      ]
    }
  );
};
var CreatorPosts_default = CreatorPosts;
export {
  CreatorPosts_default as default
};
