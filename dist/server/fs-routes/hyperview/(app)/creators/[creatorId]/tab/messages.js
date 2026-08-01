import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator.js";
import { hyperview } from "../../../../../../lib/hxml.js";
import { Text } from "../../../../../../lib/hxml-comps.js";
import { getBaseUrl } from "../../../../../../lib/hyperview.js";
import { getCreatorById } from "../../../../../../features/dashboard/creators/services.js";
import { creatorIdSchema } from "../../../../../../schemas/index.js";
import { getMessagesByCreatorSlug } from "../../../../../../features/app/services.js";
import { getUser } from "../../../../../../utils.js";
import { findFollow } from "../../../../../../features/api/services.js";
import CreatorPostsList from "../../../../../../features/hyperview/components/CreatorPostsList.js";
const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const currentPage = parseInt(c.req.query("page") ?? "1");
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const hv = hyperview(c);
  const loadMoreHref = `${baseUrl}/hyperview/creators/${creatorId}/tab/messages`;
  const [creatorError, creator] = await getCreatorById(creatorId);
  if (creatorError || !creator) {
    return hv(
      /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", style: "tab-fragment", children: /* @__PURE__ */ jsx(Text, { style: "comments-placeholder", children: "Creator not found." }) }),
      404
    );
  }
  const [error, result] = await getMessagesByCreatorSlug(
    creator.slug,
    currentPage,
    5
  );
  if (error || !result) {
    return hv(
      /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", style: "tab-fragment", children: /* @__PURE__ */ jsx(Text, { style: "comments-placeholder", children: "Posts not found." }) }),
      404
    );
  }
  const { messages, totalPages, page } = result;
  const isOwner = user?.creator?.id === creator.id;
  const isFollowing = user?.id ? Boolean(await findFollow(creator.id, user.id)) : false;
  const canReadMessages = isOwner || Boolean(user?.isAdmin) || isFollowing;
  const hasMore = page < totalPages;
  if (currentPage === 1 && messages.length === 0) {
    const emptyMessage = isOwner ? "No posts yet. Share updates with people who follow you from the dashboard." : canReadMessages ? `No posts yet. Check back soon for updates from ${creator.displayName}.` : `No posts yet. Follow ${creator.displayName} to see updates here.`;
    return hv(
      /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", style: "tab-fragment", children: /* @__PURE__ */ jsx(Text, { style: "comments-placeholder", children: emptyMessage }) })
    );
  }
  const listProps = {
    posts: messages,
    creator: {
      displayName: creator.displayName,
      coverUrl: creator.coverUrl
    },
    canReadMessages,
    page,
    hasMore,
    loadMoreHref
  };
  if (currentPage > 1) {
    return hv(
      /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsx(CreatorPostsList, { ...listProps }) })
    );
  }
  return hv(
    /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", style: "tab-fragment", children: /* @__PURE__ */ jsx(CreatorPostsList, { ...listProps }) })
  );
});
export {
  GET
};
