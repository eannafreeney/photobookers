import { and, count, eq, inArray } from "drizzle-orm";
import { db } from "../../db/client";
import { creators, follows, postLikes } from "../../db/schema";
import { err, ok } from "../../lib/result";
import { canLikePost } from "./likesPolicy";

export { canLikePost } from "./likesPolicy";

export type PostLikeState = {
  likeCount: number;
  likedByMe: boolean;
};

export async function userCanLikePost(
  user: { id: string; isAdmin?: boolean } | null,
  postAuthorUserId: string,
): Promise<boolean> {
  if (!user?.id) return false;

  const ownedCreators = await db.query.creators.findMany({
    where: eq(creators.ownerUserId, postAuthorUserId),
    columns: { id: true },
  });
  const authorCreatorIds = ownedCreators.map((c) => c.id);

  let followedCreatorIds: string[] = [];
  if (authorCreatorIds.length > 0) {
    const rows = await db
      .select({ id: follows.targetCreatorId })
      .from(follows)
      .where(
        and(
          eq(follows.followerUserId, user.id),
          inArray(follows.targetCreatorId, authorCreatorIds),
        ),
      );
    followedCreatorIds = rows
      .map((row) => row.id)
      .filter((id): id is string => Boolean(id));
  }

  return canLikePost({
    userId: user.id,
    isAdmin: user.isAdmin,
    postAuthorUserId,
    authorCreatorIds,
    followedCreatorIds,
  });
}

export async function getPostLikeStats(
  postIds: string[],
  userId?: string | null,
): Promise<Map<string, PostLikeState>> {
  const stats = new Map<string, PostLikeState>();
  for (const id of postIds) stats.set(id, { likeCount: 0, likedByMe: false });
  if (postIds.length === 0) return stats;

  const countRows = await db
    .select({
      postId: postLikes.postId,
      value: count(),
    })
    .from(postLikes)
    .where(inArray(postLikes.postId, postIds))
    .groupBy(postLikes.postId);

  for (const row of countRows) {
    stats.set(row.postId, { likeCount: row.value, likedByMe: false });
  }

  if (userId) {
    const likedRows = await db
      .select({ postId: postLikes.postId })
      .from(postLikes)
      .where(
        and(eq(postLikes.userId, userId), inArray(postLikes.postId, postIds)),
      );
    for (const row of likedRows) {
      const current = stats.get(row.postId) ?? {
        likeCount: 0,
        likedByMe: false,
      };
      stats.set(row.postId, { ...current, likedByMe: true });
    }
  }

  return stats;
}

export async function getPostLikeState(postId: string, userId?: string | null) {
  const stats = await getPostLikeStats([postId], userId);
  return stats.get(postId) ?? { likeCount: 0, likedByMe: false };
}

export async function findPostLike(userId: string, postId: string) {
  try {
    const like = await db.query.postLikes.findFirst({
      where: and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)),
    });
    if (!like) return err({ reason: "Like not found" });
    return ok(like);
  } catch (error) {
    console.error("Failed to find post like", error);
    return err({ reason: "Failed to find post like" });
  }
}

export async function insertPostLike(userId: string, postId: string) {
  try {
    await db
      .insert(postLikes)
      .values({ userId, postId })
      .onConflictDoNothing();
    return ok(undefined);
  } catch (error) {
    console.error("Failed to insert post like", error);
    return err({ reason: "Failed to insert post like" });
  }
}

export async function deletePostLike(userId: string, postId: string) {
  try {
    await db
      .delete(postLikes)
      .where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)));
    return ok(undefined);
  } catch (error) {
    console.error("Failed to delete post like", error);
    return err({ reason: "Failed to delete post like" });
  }
}
