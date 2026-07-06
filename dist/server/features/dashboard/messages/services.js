import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "../../../db/client.js";
import { creatorMessages, follows } from "../../../db/schema.js";
import { getPagination } from "../../../lib/pagination.js";
import { err, ok } from "../../../lib/result.js";
async function createMessage(creatorId, input) {
  try {
    const [msg] = await db.insert(creatorMessages).values({
      creatorId,
      body: input.body.trim(),
      imageUrls: input.imageUrls?.length ? input.imageUrls : null
    }).returning();
    if (!msg) return err({ reason: "Failed to create message" });
    return ok(msg);
  } catch (error) {
    console.error("Failed to create message", error);
    return err({ reason: "Failed to create message", cause: error });
  }
}
async function getMessagesByCreator(creatorId) {
  try {
    const messages = await db.query.creatorMessages.findMany({
      where: eq(creatorMessages.creatorId, creatorId),
      orderBy: [desc(creatorMessages.createdAt)]
    });
    return ok({ messages });
  } catch (error) {
    console.error("Failed to get messages by creator", error);
    return err({ reason: "Failed to get messages by creator", cause: error });
  }
}
async function getMessagesForFollower(followerUserId, currentPage = 1, limit = 20) {
  const followRows = await db.query.follows.findMany({
    where: and(
      eq(follows.followerUserId, followerUserId),
      eq(follows.targetType, "creator")
    ),
    columns: { targetCreatorId: true }
  });
  const followedCreatorIds = followRows.map((r) => r.targetCreatorId).filter((id) => id != null);
  if (followedCreatorIds.length === 0) {
    return { messages: [], totalPages: 0, page: 1 };
  }
  const [{ value: totalCount = 0 }] = await db.select({ value: db.$count(creatorMessages.id) }).from(creatorMessages).where(inArray(creatorMessages.creatorId, followedCreatorIds));
  const { page, offset, totalPages } = getPagination(
    currentPage,
    totalCount,
    limit
  );
  const messages = await db.query.creatorMessages.findMany({
    where: inArray(creatorMessages.creatorId, followedCreatorIds),
    orderBy: [desc(creatorMessages.createdAt)],
    limit,
    offset,
    with: {
      creator: {
        columns: { id: true, displayName: true, slug: true, coverUrl: true }
      }
    }
  });
  return { messages, totalPages, page };
}
async function deleteMessageById(messageId) {
  try {
    const [message] = await db.delete(creatorMessages).where(eq(creatorMessages.id, messageId)).returning();
    if (!message) return err({ reason: "Message not found" });
    return ok(message);
  } catch (error) {
    console.error("Failed to delete message", error);
    return err({ reason: "Failed to delete message", cause: error });
  }
}
export {
  createMessage,
  deleteMessageById,
  getMessagesByCreator,
  getMessagesForFollower
};
