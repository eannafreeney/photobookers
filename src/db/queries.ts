import { err, ok } from "../lib/result";
import { db } from "./client";
import {
  collectionItems,
  creators,
  follows,
  FollowTarget,
  posts,
  users,
  wishlists,
} from "./schema";
import { and, count, desc, eq, inArray, SQL } from "drizzle-orm";

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

/** Follow state for many creators in one query (avoids a lookup per card). */
export const findFollowedCreatorIds = async (
  userId: string,
  creatorIds: string[],
): Promise<Set<string>> => {
  if (creatorIds.length === 0) return new Set();

  const rows = await db
    .select({ creatorId: follows.targetCreatorId })
    .from(follows)
    .where(
      and(
        eq(follows.followerUserId, userId),
        inArray(follows.targetCreatorId, creatorIds),
      ),
    );

  return new Set(
    rows
      .map((row) => row.creatorId)
      .filter((id): id is string => Boolean(id)),
  );
};

export const findFollowersCount = async (creatorId: string) => {
  const result = await db
    .select({ value: count() })
    .from(follows)
    .where(eq(follows.targetCreatorId, creatorId));

  return result[0]?.value ?? 0;
};

// User-to-user follows (Collectors). Parallel to the creator helpers above but
// keyed on follows.targetUserId with targetType "user".
export const insertUserFollow = async (
  followerUserId: string,
  targetUserId: string,
) => {
  if (followerUserId === targetUserId) return; // no self-follow
  const existing = await findUserFollow(targetUserId, followerUserId);
  if (existing) return; // already following, no-op
  await db.insert(follows).values({
    followerUserId,
    targetUserId,
    targetType: "user",
  });
};

export const deleteUserFollow = async (
  targetUserId: string,
  followerUserId: string,
) => {
  await db
    .delete(follows)
    .where(
      and(
        eq(follows.targetUserId, targetUserId),
        eq(follows.followerUserId, followerUserId),
        eq(follows.targetType, "user"),
      ),
    );
};

export const findUserFollow = async (
  targetUserId: string,
  followerUserId: string,
) => {
  return await db.query.follows.findFirst({
    where: and(
      eq(follows.targetUserId, targetUserId),
      eq(follows.followerUserId, followerUserId),
      eq(follows.targetType, "user"),
    ),
  });
};

export const findUserFollowersCount = async (targetUserId: string) => {
  const result = await db
    .select({ value: count() })
    .from(follows)
    .where(
      and(
        eq(follows.targetUserId, targetUserId),
        eq(follows.targetType, "user"),
      ),
    );

  return result[0]?.value ?? 0;
};

export const countCreatorPosts = async (creatorId: string) => {
  const creator = await db.query.creators.findFirst({
    where: eq(creators.id, creatorId),
    columns: { ownerUserId: true },
  });
  if (!creator?.ownerUserId) return 0;

  const result = await db
    .select({ value: count() })
    .from(posts)
    .where(eq(posts.userId, creator.ownerUserId));

  return result[0]?.value ?? 0;
};

export const findWishlist = async (userId: string, bookId: string) => {
  try {
    const wishlist = await db.query.wishlists.findFirst({
      where: and(eq(wishlists.userId, userId), eq(wishlists.bookId, bookId)),
    });
    if (!wishlist) return err({ reason: "Wishlist not found" });
    return ok(wishlist);
  } catch (error) {
    console.error("Failed to find wishlist", error);
    return err({ reason: "Failed to find wishlist" });
  }
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
  try {
    const collectionItem = await db.query.collectionItems.findFirst({
      where: and(
        eq(collectionItems.userId, userId),
        eq(collectionItems.bookId, bookId),
      ),
    });
    if (!collectionItem) return err({ reason: "Collection item not found" });
    return ok(collectionItem);
  } catch (error) {
    console.error("Failed to find collection item", error);
    return err({ reason: "Failed to find collection item" });
  }
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

export const findPost = async (postId: string) => {
  return await db.query.posts.findFirst({
    where: eq(posts.id, postId),
  });
};

export const deletePostById = async (postId: string) => {
  await db.delete(posts).where(eq(posts.id, postId));
};

export const listPosts = async (userId: string) => {
  return await db.query.posts.findMany({
    where: eq(posts.userId, userId),
    orderBy: [desc(posts.createdAt)],
  });
};
