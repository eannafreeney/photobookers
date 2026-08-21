import { err, ok } from "../lib/result.js";
import { db } from "./client.js";
import {
  collectionItems,
  creators,
  follows,
  posts,
  wishlists
} from "./schema.js";
import { and, count, desc, eq, inArray } from "drizzle-orm";
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
const findFollowedCreatorIds = async (userId, creatorIds) => {
  if (creatorIds.length === 0) return /* @__PURE__ */ new Set();
  const rows = await db.select({ creatorId: follows.targetCreatorId }).from(follows).where(
    and(
      eq(follows.followerUserId, userId),
      inArray(follows.targetCreatorId, creatorIds)
    )
  );
  return new Set(
    rows.map((row) => row.creatorId).filter((id) => Boolean(id))
  );
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
  const creator = await db.query.creators.findFirst({
    where: eq(creators.id, creatorId),
    columns: { ownerUserId: true }
  });
  if (!creator?.ownerUserId) return 0;
  const result = await db.select({ value: count() }).from(posts).where(eq(posts.userId, creator.ownerUserId));
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
const findPost = async (postId) => {
  return await db.query.posts.findFirst({
    where: eq(posts.id, postId)
  });
};
const deletePostById = async (postId) => {
  await db.delete(posts).where(eq(posts.id, postId));
};
const listPosts = async (userId) => {
  return await db.query.posts.findMany({
    where: eq(posts.userId, userId),
    orderBy: [desc(posts.createdAt)]
  });
};
export {
  countCreatorPosts,
  deleteCollectionItem,
  deleteFollow,
  deletePostById,
  deleteUserFollow,
  deleteWishlist,
  findCollectionItem,
  findFollow,
  findFollowedCreatorIds,
  findFollowersCount,
  findPost,
  findUserFollow,
  findUserFollowersCount,
  findWishlist,
  insertCollectionItem,
  insertFollow,
  insertUserFollow,
  insertWishlist,
  listPosts
};
