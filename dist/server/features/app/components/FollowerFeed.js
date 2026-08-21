import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import ListNavigation from "./ListNavigation.js";
import FeedBookCard from "../../../components/app/FeedBookCard.js";
import PostCard from "../../collectors/components/PostCard.js";
import { getPostLikeStats } from "../../../domain/posts/likes.js";
const emptyCopy = {
  posts: "Start following artists, publishers, and collectors to see their posts here.",
  books: "Start following artists and publishers to see their latest releases here."
};
const FollowerFeed = async ({
  user,
  tab,
  currentPath,
  items,
  totalPages,
  page
}) => {
  const targetId = "feed-items";
  const postIds = items.flatMap(
    (item) => item.kind === "post" ? [item.post.id] : []
  );
  const likeStats = await getPostLikeStats(postIds, user.id);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    items.length === 0 ? /* @__PURE__ */ jsx("p", { class: "text-on-surface", children: emptyCopy[tab] }) : /* @__PURE__ */ jsx("div", { id: targetId, "x-merge": "append", class: "flex flex-col gap-4", children: items.map(
      (item) => item.kind === "post" ? /* @__PURE__ */ jsx(
        PostCard,
        {
          post: item.post,
          author: item.post.author,
          creator: item.post.creator,
          likeCount: likeStats.get(item.post.id)?.likeCount ?? 0,
          likedByMe: likeStats.get(item.post.id)?.likedByMe ?? false
        }
      ) : /* @__PURE__ */ jsx(
        FeedBookCard,
        {
          book: item.book,
          user,
          className: "w-full max-w-none"
        }
      )
    ) }),
    /* @__PURE__ */ jsx(
      ListNavigation,
      {
        isInfiniteScroll: true,
        targetId,
        totalPages,
        page,
        currentPath
      }
    )
  ] });
};
var FollowerFeed_default = FollowerFeed;
export {
  FollowerFeed_default as default
};
