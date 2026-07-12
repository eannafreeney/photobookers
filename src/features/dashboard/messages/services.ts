import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "../../../db/client";
import { creatorMessages, follows } from "../../../db/schema";
import { getPagination } from "../../../lib/pagination";
import { err, ok } from "../../../lib/result";

export async function createMessage(
  creatorId: string,
  input: { body: string; imageUrl?: string },
) {
  try {
    const [msg] = await db
      .insert(creatorMessages)
      .values({
        creatorId,
        body: input.body.trim(),
        imageUrl: input.imageUrl ?? null,
      })
      .returning();
    if (!msg) return err({ reason: "Failed to create message" });
    return ok(msg);
  } catch (error) {
    console.error("Failed to create message", error);
    return err({ reason: "Failed to create message", cause: error });
  }
}

export async function getMessagesByCreator(creatorId: string) {
  try {
    const messages = await db.query.creatorMessages.findMany({
      where: eq(creatorMessages.creatorId, creatorId),
      orderBy: [desc(creatorMessages.createdAt)],
    });
    return ok({ messages });
  } catch (error) {
    console.error("Failed to get messages by creator", error);
    return err({ reason: "Failed to get messages by creator", cause: error });
  }
}

export async function getMessagesForFollower(
  followerUserId: string,
  currentPage = 1,
  limit = 20,
) {
  const followRows = await db.query.follows.findMany({
    where: and(
      eq(follows.followerUserId, followerUserId),
      eq(follows.targetType, "creator"),
    ),
    columns: { targetCreatorId: true },
  });

  const followedCreatorIds = followRows
    .map((r) => r.targetCreatorId)
    .filter((id): id is string => id != null);

  if (followedCreatorIds.length === 0) {
    return { messages: [], totalPages: 0, page: 1 };
  }

  const [{ value: totalCount = 0 }] = await db
    .select({ value: db.$count(creatorMessages.id) })
    .from(creatorMessages)
    .where(inArray(creatorMessages.creatorId, followedCreatorIds));

  const { page, offset, totalPages } = getPagination(
    currentPage,
    totalCount,
    limit,
  );

  const messages = await db.query.creatorMessages.findMany({
    where: inArray(creatorMessages.creatorId, followedCreatorIds),
    orderBy: [desc(creatorMessages.createdAt)],
    limit,
    offset,
    with: {
      creator: {
        columns: { id: true, displayName: true, slug: true, coverUrl: true },
      },
    },
  });

  return { messages, totalPages, page };
}

export async function deleteMessageById(messageId: string) {
  try {
    const [message] = await db
      .delete(creatorMessages)
      .where(eq(creatorMessages.id, messageId))
      .returning();
    if (!message) return err({ reason: "Message not found" });
    return ok(message);
  } catch (error) {
    console.error("Failed to delete message", error);
    return err({ reason: "Failed to delete message", cause: error });
  }
}
