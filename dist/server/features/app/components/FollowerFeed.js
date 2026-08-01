import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import CreatorMessage from "./creatorPage/CreatorMessage.js";
import ListNavigation from "./ListNavigation.js";
import FeedBookCard from "../../../components/app/FeedBookCard.js";
import PostCard from "../../collectors/components/PostCard.js";
const FollowerFeed = ({
  user,
  currentPath,
  items,
  totalPages,
  page
}) => {
  const targetId = "feed-items";
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    items.length === 0 ? /* @__PURE__ */ jsx("p", { class: "text-on-surface", children: "Start following artists and publishers to see their latest releases and updates here." }) : /* @__PURE__ */ jsx("div", { id: targetId, "x-merge": "append", class: "flex flex-col gap-4", children: items.map(
      (item) => item.kind === "message" ? /* @__PURE__ */ jsx(
        CreatorMessage,
        {
          canReadMessages: true,
          creator: item.message.creator,
          message: item.message
        }
      ) : item.kind === "post" ? /* @__PURE__ */ jsx(PostCard, { post: item.post, author: item.post.author }) : /* @__PURE__ */ jsx(
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
