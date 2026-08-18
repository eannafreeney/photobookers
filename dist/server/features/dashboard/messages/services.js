import { count, desc, eq, inArray } from "drizzle-orm";
import { db } from "../../../db/client.js";
import { collectorPosts, creators, follows } from "../../../db/schema.js";
import { getPagination } from "../../../lib/pagination.js";
import { err, ok } from "../../../lib/result.js";
import {
  createPost,
  deletePost,
  getPostById,
  listPostsByCreatorId,
  listPostsByUserId,
  updatePost
} from "../../../domain/posts/services.js";
async function ownerUserIdForCreator(creatorId) {
  const creator = await db.query.creators.findFirst({
    where: eq(creators.id, creatorId),
    columns: { ownerUserId: true }
  });
  return creator?.ownerUserId ?? null;
}
async function postBelongsToCreator(postUserId, creatorId) {
  const ownerId = await ownerUserIdForCreator(creatorId);
  return Boolean(ownerId && ownerId === postUserId);
}
async function createMessage(creatorId, input) {
  const userId = await ownerUserIdForCreator(creatorId);
  if (!userId) return err({ reason: "Creator has no owner account" });
  return createPost(userId, input);
}
async function getMessagesByCreator(creatorId) {
  const [error, result] = await listPostsByCreatorId(creatorId, 1, 1e4);
  if (error || !result)
    return err(error ?? { reason: "Failed to get messages" });
  return ok({ messages: result.posts });
}
async function getMessageById(messageId) {
  return getPostById(messageId);
}
async function updateMessageById(messageId, input, ownerUserId) {
  if (ownerUserId) return updatePost(messageId, ownerUserId, input);
  const [errFind, post] = await getPostById(messageId);
  if (errFind || !post) return err(errFind ?? { reason: "Message not found" });
  return updatePost(messageId, post.userId, input);
}
async function getMessagesForFollower(followerUserId, currentPage = 1, limit = 20) {
  try {
    const followRows = await db.query.follows.findMany({
      where: eq(follows.followerUserId, followerUserId),
      columns: { targetCreatorId: true, targetType: true }
    });
    const followedCreatorIds = followRows.filter((f) => f.targetType === "creator" && f.targetCreatorId).map((f) => f.targetCreatorId);
    if (followedCreatorIds.length === 0) {
      return ok({ messages: [], totalPages: 0, page: 1 });
    }
    const ownedCreators = await db.query.creators.findMany({
      where: inArray(creators.id, followedCreatorIds),
      columns: {
        id: true,
        ownerUserId: true,
        displayName: true,
        slug: true,
        coverUrl: true
      }
    });
    const ownerIds = ownedCreators.map((c) => c.ownerUserId).filter((id) => Boolean(id));
    if (ownerIds.length === 0) {
      return ok({ messages: [], totalPages: 0, page: 1 });
    }
    const creatorByOwner = new Map(
      ownedCreators.filter((c) => c.ownerUserId).map((c) => [c.ownerUserId, c])
    );
    const [{ value: total = 0 }] = await db.select({ value: count() }).from(collectorPosts).where(inArray(collectorPosts.userId, ownerIds));
    const { page, offset, totalPages } = getPagination(
      currentPage,
      total,
      limit
    );
    const posts = await db.query.collectorPosts.findMany({
      where: inArray(collectorPosts.userId, ownerIds),
      orderBy: [desc(collectorPosts.createdAt)],
      limit,
      offset
    });
    const messages = posts.flatMap((post) => {
      const creator = creatorByOwner.get(post.userId);
      if (!creator) return [];
      return [
        {
          ...post,
          creator: {
            id: creator.id,
            displayName: creator.displayName,
            slug: creator.slug,
            coverUrl: creator.coverUrl
          }
        }
      ];
    });
    return ok({ messages, totalPages, page });
  } catch (error) {
    console.error("Failed to get messages for follower", error);
    return err({ reason: "Failed to get messages for follower", error });
  }
}
async function deleteMessageById(messageId, userId) {
  if (userId) return deletePost(messageId, userId);
  const [errFind, post] = await getPostById(messageId);
  if (errFind || !post) return err(errFind ?? { reason: "Message not found" });
  return deletePost(messageId, post.userId);
}
export {
  createMessage,
  deleteMessageById,
  getMessageById,
  getMessagesByCreator,
  getMessagesForFollower,
  listPostsByUserId,
  postBelongsToCreator,
  updateMessageById
};
