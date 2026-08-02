import { count, desc, eq, inArray } from "drizzle-orm";
import { db } from "../../../db/client";
import { collectorPosts, creators, follows } from "../../../db/schema";
import { getPagination } from "../../../lib/pagination";
import { err, ok } from "../../../lib/result";
import {
  createPost,
  deletePost,
  getPostById,
  listPostsByCreatorId,
  listPostsByUserId,
  updatePost,
} from "../../../domain/posts/services";

async function ownerUserIdForCreator(creatorId: string) {
  const creator = await db.query.creators.findFirst({
    where: eq(creators.id, creatorId),
    columns: { ownerUserId: true },
  });
  return creator?.ownerUserId ?? null;
}

export async function postBelongsToCreator(
  postUserId: string,
  creatorId: string,
) {
  const ownerId = await ownerUserIdForCreator(creatorId);
  return Boolean(ownerId && ownerId === postUserId);
}

/** Create a post as the creator's owner user. */
export async function createMessage(
  creatorId: string,
  input: { body: string; imageUrl?: string },
) {
  const userId = await ownerUserIdForCreator(creatorId);
  if (!userId) return err({ reason: "Creator has no owner account" });
  return createPost(userId, input);
}

export async function getMessagesByCreator(creatorId: string) {
  const [error, result] = await listPostsByCreatorId(creatorId, 1, 10_000);
  if (error || !result)
    return err(error ?? { reason: "Failed to get messages" });
  return ok({ messages: result.posts });
}

export async function getMessageById(messageId: string) {
  return getPostById(messageId);
}

export async function updateMessageById(
  messageId: string,
  input: { body: string; imageUrl?: string },
  ownerUserId?: string,
) {
  if (ownerUserId) return updatePost(messageId, ownerUserId, input);
  const [errFind, post] = await getPostById(messageId);
  if (errFind || !post) return err(errFind ?? { reason: "Message not found" });
  return updatePost(messageId, post.userId, input);
}

export async function getMessagesForFollower(
  followerUserId: string,
  currentPage = 1,
  limit = 20,
) {
  try {
    const followRows = await db.query.follows.findMany({
      where: eq(follows.followerUserId, followerUserId),
      columns: { targetCreatorId: true, targetType: true },
    });
    const followedCreatorIds = followRows
      .filter((f) => f.targetType === "creator" && f.targetCreatorId)
      .map((f) => f.targetCreatorId!);

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
        coverUrl: true,
      },
    });
    const ownerIds = ownedCreators
      .map((c) => c.ownerUserId)
      .filter((id): id is string => Boolean(id));
    if (ownerIds.length === 0) {
      return ok({ messages: [], totalPages: 0, page: 1 });
    }

    const creatorByOwner = new Map(
      ownedCreators
        .filter((c) => c.ownerUserId)
        .map((c) => [c.ownerUserId!, c]),
    );

    const [{ value: total = 0 }] = await db
      .select({ value: count() })
      .from(collectorPosts)
      .where(inArray(collectorPosts.userId, ownerIds));

    const { page, offset, totalPages } = getPagination(
      currentPage,
      total,
      limit,
    );

    const posts = await db.query.collectorPosts.findMany({
      where: inArray(collectorPosts.userId, ownerIds),
      orderBy: [desc(collectorPosts.createdAt)],
      limit,
      offset,
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
            coverUrl: creator.coverUrl,
          },
        },
      ];
    });

    return ok({ messages, totalPages, page });
  } catch (error) {
    console.error("Failed to get messages for follower", error);
    return err({ reason: "Failed to get messages for follower", error });
  }
}

export async function deleteMessageById(messageId: string, userId?: string) {
  if (userId) return deletePost(messageId, userId);
  const [errFind, post] = await getPostById(messageId);
  if (errFind || !post) return err(errFind ?? { reason: "Message not found" });
  return deletePost(messageId, post.userId);
}

export { listPostsByUserId };
