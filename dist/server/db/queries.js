import { err, ok } from "../lib/result.js";
import { db } from "./client.js";
import {
  collectionItems,
  creatorMessages,
  follows,
  wishlists
} from "./schema.js";
import { and, count, eq } from "drizzle-orm";
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
export {
  countCreatorPosts,
  deleteCollectionItem,
  deleteFollow,
  deleteWishlist,
  findCollectionItem,
  findFollow,
  findFollowersCount,
  findWishlist,
  insertCollectionItem,
  insertFollow,
  insertWishlist
};
