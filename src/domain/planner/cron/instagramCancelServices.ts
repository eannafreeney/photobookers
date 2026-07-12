import { eq } from "drizzle-orm";
import { db } from "../../../db/client";
import { creators, newsletterCampaigns } from "../../../db/schema";
import { err, ok, type Result } from "../../../lib/result";
import type { TrendingInstagramPostKind } from "../../../features/dashboard/admin/planner/newsletter/types";
import {
  bufferDeletePost,
  bufferPostExists,
} from "../../../features/dashboard/admin/planner/social-media/buffer";
import type { InstagramCancelAction } from "../../../lib/adminActionToken";

async function deleteBufferPostIfPresent(
  postId: string | null | undefined,
): Promise<Result<void, { reason: string }>> {
  if (!postId || postId.startsWith("dry-run://")) return ok(undefined);

  const [existsError, exists] = await bufferPostExists(postId);
  if (existsError) return err(existsError);
  if (!exists) return ok(undefined);

  return bufferDeletePost(postId);
}

export async function cancelTrendingInstagramPost(
  campaignId: string,
  kind: TrendingInstagramPostKind,
): Promise<Result<{ alreadyCancelled: boolean }, { reason: string }>> {
  const campaign = await db.query.newsletterCampaigns.findFirst({
    where: eq(newsletterCampaigns.id, campaignId),
    columns: { id: true, generatedContent: true },
  });
  if (!campaign) return err({ reason: "Newsletter campaign not found" });

  const state = campaign.generatedContent?.trendingInstagram;
  const post = state?.posts?.[kind];
  if (!post) return err({ reason: "Trending Instagram post not found" });

  if (post.cancelledAt) {
    return ok({ alreadyCancelled: true });
  }

  const [deleteError] = await deleteBufferPostIfPresent(post.bufferPostId);
  if (deleteError) return err(deleteError);

  const now = new Date().toISOString();
  const posts = { ...(state?.posts ?? {}) };
  posts[kind] = {
    ...post,
    cancelledAt: now,
    bufferPostId: null,
    queuedAt: null,
    error: null,
  };

  await db
    .update(newsletterCampaigns)
    .set({
      generatedContent: {
        ...(campaign.generatedContent ?? {
          generatedAt: now,
        }),
        trendingInstagram: {
          ...(state ?? { editionWeekStart: "", posts: {} }),
          posts,
        },
      },
      updatedAt: new Date(),
    })
    .where(eq(newsletterCampaigns.id, campaignId));

  return ok({ alreadyCancelled: false });
}

export async function cancelVerifiedCreatorInstagramPost(
  creatorId: string,
): Promise<Result<{ alreadyCancelled: boolean }, { reason: string }>> {
  const creator = await db.query.creators.findFirst({
    where: eq(creators.id, creatorId),
    columns: {
      id: true,
      verifiedInstagramBufferPostId: true,
      verifiedInstagramCancelledAt: true,
    },
  });
  if (!creator) return err({ reason: "Creator not found" });

  if (creator.verifiedInstagramCancelledAt) {
    return ok({ alreadyCancelled: true });
  }

  const [deleteError] = await deleteBufferPostIfPresent(
    creator.verifiedInstagramBufferPostId,
  );
  if (deleteError) return err(deleteError);

  const now = new Date();
  await db
    .update(creators)
    .set({
      verifiedInstagramCancelledAt: now,
      verifiedInstagramQueuedAt: null,
      verifiedInstagramBufferPostId: null,
      verifiedInstagramError: null,
      updatedAt: now,
    })
    .where(eq(creators.id, creatorId));

  return ok({ alreadyCancelled: false });
}

export async function cancelInstagramPostFromToken(
  action: InstagramCancelAction,
): Promise<Result<{ alreadyCancelled: boolean }, { reason: string }>> {
  if (action.type === "trending") {
    return cancelTrendingInstagramPost(action.campaignId, action.kind);
  }
  return cancelVerifiedCreatorInstagramPost(action.creatorId);
}
