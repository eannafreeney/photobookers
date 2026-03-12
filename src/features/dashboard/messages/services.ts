import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "../../../db/client";
import { creatorMessages, follows } from "../../../db/schema";
import { getPagination } from "../../../lib/pagination";

export async function createMessage(
  creatorId: string,
  input: { body: string; imageUrls?: string[] },
) {
  const [msg] = await db
    .insert(creatorMessages)
    .values({
      creatorId,
      body: input.body.trim(),
      imageUrls: input.imageUrls?.length ? input.imageUrls : null,
    })
    .returning();
  return msg ?? null;
}

export async function getMessagesByCreator(creatorId: string) {
  return db.query.creatorMessages.findMany({
    where: eq(creatorMessages.creatorId, creatorId),
    orderBy: [desc(creatorMessages.createdAt)],
  });
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
