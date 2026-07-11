import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { hyperview } from "../../../../../../lib/hxml";
import { Text } from "../../../../../../lib/hxml-comps";
import { getBaseUrl } from "../../../../../../lib/hyperview";
import { getCreatorById } from "../../../../../../features/dashboard/creators/services";
import { creatorIdSchema } from "../../../../../../schemas";
import { getMessagesByCreatorSlug } from "../../../../../../features/app/services";
import { getUser } from "../../../../../../utils";
import { findFollow } from "../../../../../../features/api/services";
import CreatorPostsList from "../../../../../../features/hyperview/components/CreatorPostsList";

export const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const currentPage = parseInt(c.req.query("page") ?? "1");
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const hv = hyperview(c);
  const loadMoreHref = `${baseUrl}/hyperview/creators/${creatorId}/tab/messages`;

  const [creatorError, creator] = await getCreatorById(creatorId);
  if (creatorError || !creator) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="comments-placeholder">Creator not found.</Text>
      </view>,
      404,
    );
  }

  const [error, result] = await getMessagesByCreatorSlug(
    creator.slug,
    currentPage,
    5,
  );

  if (error || !result) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="comments-placeholder">Posts not found.</Text>
      </view>,
      404,
    );
  }

  const { messages, totalPages, page } = result;
  const isOwner = user?.creator?.id === creator.id;
  const isFollowing = user?.id
    ? Boolean(await findFollow(creator.id, user.id))
    : false;
  const canReadMessages =
    isOwner || Boolean(user?.isAdmin) || isFollowing;
  const hasMore = page < totalPages;

  if (currentPage === 1 && messages.length === 0) {
    const emptyMessage = isOwner
      ? "No posts yet. Share updates with people who follow you from the dashboard."
      : canReadMessages
        ? `No posts yet. Check back soon for updates from ${creator.displayName}.`
        : `No posts yet. Follow ${creator.displayName} to see updates here.`;

    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="comments-placeholder">{emptyMessage}</Text>
      </view>,
    );
  }

  const listProps = {
    posts: messages,
    creator: {
      displayName: creator.displayName,
      coverUrl: creator.coverUrl,
    },
    canReadMessages,
    page,
    hasMore,
    loadMoreHref,
  };

  if (currentPage > 1) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview">
        <CreatorPostsList {...listProps} />
      </view>,
    );
  }

  return hv(
    <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
      <CreatorPostsList {...listProps} />
    </view>,
  );
});
