import { err, ok } from "../lib/result.js";
import { db } from "./client.js";
import {
  collectionItems,
  collectorPosts,
  creatorMessages,
  follows,
  wishlists
} from "./schema.js";
import { and, count, desc, eq } from "drizzle-orm";
const deleteFollow = async (creatorId, userId) => {
  await db.delete(follows).where(
    and(
      eq(follows.targetCreatorId, creatorId),
      eq(follows.followerUserId, userId)
    )
  );
};
const insertFollow = async (userId, creatorId, targetType = "creator") => {
  await db.insert(follows).values({
    followerUserId: userId,
    targetCreatorId: creatorId,
    targetType
  });
};
const findFollow = async (creatorId, userId) => {
  return await db.query.follows.findFirst({
    where: and(
      eq(follows.targetCreatorId, creatorId),
      eq(follows.followerUserId, userId)
    )
  });
};
const findFollowersCount = async (creatorId) => {
  const result = await db.select({ value: count() }).from(follows).where(eq(follows.targetCreatorId, creatorId));
  return result[0]?.value ?? 0;
};
const insertUserFollow = async (followerUserId, targetUserId) => {
  if (followerUserId === targetUserId) return;
  const existing = await findUserFollow(targetUserId, followerUserId);
  if (existing) return;
  await db.insert(follows).values({
    followerUserId,
    targetUserId,
    targetType: "user"
  });
};
const deleteUserFollow = async (targetUserId, followerUserId) => {
  await db.delete(follows).where(
    and(
      eq(follows.targetUserId, targetUserId),
      eq(follows.followerUserId, followerUserId),
      eq(follows.targetType, "user")
    )
  );
};
const findUserFollow = async (targetUserId, followerUserId) => {
  return await db.query.follows.findFirst({
    where: and(
      eq(follows.targetUserId, targetUserId),
      eq(follows.followerUserId, followerUserId),
      eq(follows.targetType, "user")
    )
  });
};
const findUserFollowersCount = async (targetUserId) => {
  const result = await db.select({ value: count() }).from(follows).where(
    and(
      eq(follows.targetUserId, targetUserId),
      eq(follows.targetType, "user")
    )
  );
  return result[0]?.value ?? 0;
};
const countCreatorPosts = async (creatorId) => {
  const result = await db.select({ value: count() }).from(creatorMessages).where(eq(creatorMessages.creatorId, creatorId));
  return result[0]?.value ?? 0;
};
const findWishlist = async (userId, bookId) => {
  try {
    const wishlist = await db.query.wishlists.findFirst({
      where: and(eq(wishlists.userId, userId), eq(wishlists.bookId, bookId))
    });
    if (!wishlist) return err({ reason: "Wishlist not found" });
    return ok(wishlist);
  } catch (error) {
    console.error("Failed to find wishlist", error);
    return err({ reason: "Failed to find wishlist" });
  }
};
const insertWishlist = async (userId, bookId) => {
  const existing = await findWishlist(userId, bookId);
  if (existing) {
    return;
  }
  await db.insert(wishlists).values({
    userId,
    bookId
  });
};
const deleteWishlist = async (userId, bookId) => {
  await db.delete(wishlists).where(and(eq(wishlists.userId, userId), eq(wishlists.bookId, bookId)));
};
const findCollectionItem = async (userId, bookId) => {
  try {
    const collectionItem = await db.query.collectionItems.findFirst({
      where: and(
        eq(collectionItems.userId, userId),
        eq(collectionItems.bookId, bookId)
      )
    });
    if (!collectionItem) return err({ reason: "Collection item not found" });
    return ok(collectionItem);
  } catch (error) {
    console.error("Failed to find collection item", error);
    return err({ reason: "Failed to find collection item" });
  }
};
const insertCollectionItem = async (userId, bookId) => {
  await db.insert(collectionItems).values({
    userId,
    bookId
  });
};
const deleteCollectionItem = async (userId, bookId) => {
  await db.delete(collectionItems).where(
    and(
      eq(collectionItems.userId, userId),
      eq(collectionItems.bookId, bookId)
    )
  );
};
const insertCollectorPost = async (userId, input) => {
  const [post] = await db.insert(collectorPosts).values({ userId, body: input.body, imageUrl: input.imageUrl }).returning();
  return post;
};
const findCollectorPost = async (postId) => {
  return await db.query.collectorPosts.findFirst({
    where: eq(collectorPosts.id, postId)
  });
};
const deleteCollectorPost = async (postId) => {
  await db.delete(collectorPosts).where(eq(collectorPosts.id, postId));
};
const listCollectorPosts = async (userId) => {
  return await db.query.collectorPosts.findMany({
    where: eq(collectorPosts.userId, userId),
    orderBy: [desc(collectorPosts.createdAt)]
  });
};
const countCollectorPosts = async (userId) => {
  const result = await db.select({ value: count() }).from(collectorPosts).where(eq(collectorPosts.userId, userId));
  return result[0]?.value ?? 0;
};
export {
  countCollectorPosts,
  countCreatorPosts,
  deleteCollectionItem,
  deleteCollectorPost,
  deleteFollow,
  deleteUserFollow,
  deleteWishlist,
  findCollectionItem,
  findCollectorPost,
  findFollow,
  findFollowersCount,
  findUserFollow,
  findUserFollowersCount,
  findWishlist,
  insertCollectionItem,
  insertCollectorPost,
  insertFollow,
  insertUserFollow,
  insertWishlist,
  listCollectorPosts
};
