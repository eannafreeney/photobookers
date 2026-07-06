import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { findFollow } from "../../../db/queries.js";
import { getMessagesByCreatorSlug } from "../services.js";
import CreatorMessage from "./CreatorMessage.js";
import ListNavigation from "./ListNavigation.js";
const CreatorMessages = async ({ creatorSlug, user }) => {
  const [error, result] = await getMessagesByCreatorSlug(creatorSlug, 1, 5);
  if (error || !result) return /* @__PURE__ */ jsx(Fragment, {});
  const { messages, totalPages, page, creator } = result;
  const isOwner = user?.creator?.id === creator.id;
  const isFollower = user?.id ? Boolean(await findFollow(creator.id, user.id)) || isOwner : false;
  const targetId = `creator-messages-${creator.id}`;
  return /* @__PURE__ */ jsxs("div", { id: targetId, class: "w-full flex flex-col gap-4", children: [
    messages.length === 0 ? /* @__PURE__ */ jsx("div", { class: "rounded-radius border border-outline bg-surface-alt p-6 text-sm text-on-surface", children: isOwner ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("p", { class: "font-medium text-on-surface-strong", children: "No posts yet" }),
      /* @__PURE__ */ jsx("p", { class: "mt-2 text-pretty", children: "Share fair dates, work-in-progress shots, or news with people who follow you." }),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/dashboard/messages",
          class: "mt-4 inline-block text-sm font-medium text-accent hover:underline",
          children: "Write your first post \u2192"
        }
      )
    ] }) : isFollower ? /* @__PURE__ */ jsxs("p", { children: [
      "No posts yet. Check back soon for updates from",
      " ",
      creator.displayName,
      "."
    ] }) : /* @__PURE__ */ jsxs("p", { children: [
      "No posts yet. Follow ",
      creator.displayName,
      " to see updates here."
    ] }) }) : messages.map((message, index) => /* @__PURE__ */ jsx(
      CreatorMessage,
      {
        creator,
        message,
        isFollower,
        user,
        isFirst: index === 0
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
  ] });
};
var CreatorMessages_default = CreatorMessages;
export {
  CreatorMessages_default as default
};
