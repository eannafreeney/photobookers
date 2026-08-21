import { and, count, eq, inArray } from "drizzle-orm";
import { db } from "../../db/client.js";
import { creators, follows, postLikes } from "../../db/schema.js";
import { err, ok } from "../../lib/result.js";
import { canLikePost } from "./likesPolicy.js";
import { canLikePost as canLikePost2 } from "./likesPolicy.js";
async function userCanLikePost(user, postAuthorUserId) {
  if (!user?.id) return false;
  const ownedCreators = await db.query.creators.findMany({
    where: eq(creators.ownerUserId, postAuthorUserId),
    columns: { id: true }
  });
  const authorCreatorIds = ownedCreators.map((c) => c.id);
  let followedCreatorIds = [];
  if (authorCreatorIds.length > 0) {
    const rows = await db.select({ id: follows.targetCreatorId }).from(follows).where(
      and(
        eq(follows.followerUserId, user.id),
        inArray(follows.targetCreatorId, authorCreatorIds)
      )
    );
    followedCreatorIds = rows.map((row) => row.id).filter((id) => Boolean(id));
  }
  return canLikePost({
    userId: user.id,
    isAdmin: user.isAdmin,
    postAuthorUserId,
    authorCreatorIds,
    followedCreatorIds
  });
}
async function getPostLikeStats(postIds, userId) {
  const stats = /* @__PURE__ */ new Map();
  for (const id of postIds) stats.set(id, { likeCount: 0, likedByMe: false });
  if (postIds.length === 0) return stats;
  const countRows = await db.select({
    postId: postLikes.postId,
    value: count()
  }).from(postLikes).where(inArray(postLikes.postId, postIds)).groupBy(postLikes.postId);
  for (const row of countRows) {
    stats.set(row.postId, { likeCount: row.value, likedByMe: false });
  }
  if (userId) {
    const likedRows = await db.select({ postId: postLikes.postId }).from(postLikes).where(
      and(eq(postLikes.userId, userId), inArray(postLikes.postId, postIds))
    );
    for (const row of likedRows) {
      const current = stats.get(row.postId) ?? {
        likeCount: 0,
        likedByMe: false
      };
      stats.set(row.postId, { ...current, likedByMe: true });
    }
  }
  return stats;
}
async function getPostLikeState(postId, userId) {
  const stats = await getPostLikeStats([postId], userId);
  return stats.get(postId) ?? { likeCount: 0, likedByMe: false };
}
async function findPostLike(userId, postId) {
  try {
    const like = await db.query.postLikes.findFirst({
      where: and(eq(postLikes.userId, userId), eq(postLikes.postId, postId))
    });
    if (!like) return err({ reason: "Like not found" });
    return ok(like);
  } catch (error) {
    console.error("Failed to find post like", error);
    return err({ reason: "Failed to find post like" });
  }
}
async function insertPostLike(userId, postId) {
  try {
    await db.insert(postLikes).values({ userId, postId }).onConflictDoNothing();
    return ok(void 0);
  } catch (error) {
    console.error("Failed to insert post like", error);
    return err({ reason: "Failed to insert post like" });
  }
}
async function deletePostLike(userId, postId) {
  try {
    await db.delete(postLikes).where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)));
    return ok(void 0);
  } catch (error) {
    console.error("Failed to delete post like", error);
    return err({ reason: "Failed to delete post like" });
  }
}
export {
  canLikePost2 as canLikePost,
  deletePostLike,
  findPostLike,
  getPostLikeState,
  getPostLikeStats,
  insertPostLike,
  userCanLikePost
};
