import { db } from "./client";
import { collectionItems, follows, FollowTarget, wishlists } from "./schema";
import { and, count, eq, SQL } from "drizzle-orm";

export const deleteFollow = async (creatorId: string, userId: string) => {
  await db
    .delete(follows)
    .where(
      and(
        eq(follows.targetCreatorId, creatorId),
        eq(follows.followerUserId, userId),
      ),
    );
};

export const insertFollow = async (
  userId: string,
  creatorId: string,
  targetType: FollowTarget = "creator",
) => {
  await db.insert(follows).values({
    followerUserId: userId,
    targetCreatorId: creatorId,
    targetType,
  });
};

export const findFollow = async (creatorId: string, userId: string) => {
  return await db.query.follows.findFirst({
    where: and(
      eq(follows.targetCreatorId, creatorId),
      eq(follows.followerUserId, userId),
    ),
  });
};

export const findFollowersCount = async (creatorId: string) => {
  const result = await db
    .select({ value: count() })
    .from(follows)
    .where(eq(follows.targetCreatorId, creatorId));

  return result[0]?.value ?? 0;
};

export const findWishlist = async (userId: string, bookId: string) => {
  return await db.query.wishlists.findFirst({
    where: and(eq(wishlists.userId, userId), eq(wishlists.bookId, bookId)),
  });
};

export const insertWishlist = async (userId: string, bookId: string) => {
  // Check if already exists to avoid duplicate key error
  const existing = await findWishlist(userId, bookId);
  if (existing) {
    return; // Already wishlisted, no-op
  }

  await db.insert(wishlists).values({
    userId,
    bookId,
  });
};

export const deleteWishlist = async (userId: string, bookId: string) => {
  await db
    .delete(wishlists)
    .where(and(eq(wishlists.userId, userId), eq(wishlists.bookId, bookId)));
};

export const findCollectionItem = async (userId: string, bookId: string) => {
  return await db.query.collectionItems.findFirst({
    where: and(
      eq(collectionItems.userId, userId),
      eq(collectionItems.bookId, bookId),
    ),
  });
};

export const insertCollectionItem = async (userId: string, bookId: string) => {
  await db.insert(collectionItems).values({
    userId,
    bookId,
  });
};

export const deleteCollectionItem = async (userId: string, bookId: string) => {
  await db
    .delete(collectionItems)
    .where(
      and(
        eq(collectionItems.userId, userId),
        eq(collectionItems.bookId, bookId),
      ),
    );
};
