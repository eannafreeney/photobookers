import { and, count, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  bookComments,
  books,
  collectionItems,
  creators,
  follows,
  likes,
  wishlists
} from "../../db/schema.js";
import {
  buildCreatedAtFilter
} from "../book-analytics/dateRange.js";
import { err, ok } from "../../lib/result.js";
const findLike = async (userId, bookId) => {
  try {
    const like = await db.query.likes.findFirst({
      where: and(eq(likes.userId, userId), eq(likes.bookId, bookId))
    });
    if (!like) return err({ reason: "Like not found" });
    return ok(like);
  } catch (error) {
    console.error("Failed to find like", error);
    return err({ reason: "Failed to find like" });
  }
};
const insertLike = async (userId, bookId) => {
  try {
    await db.insert(likes).values({ userId, bookId }).onConflictDoNothing();
    return ok(void 0);
  } catch (error) {
    console.error("Failed to insert like", error);
    return err({ reason: "Failed to insert like" });
  }
};
const deleteLike = async (userId, bookId) => {
  try {
    await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.bookId, bookId)));
    return ok(void 0);
  } catch (error) {
    console.error("Failed to delete like", error);
    return err({ reason: "Failed to delete like" });
  }
};
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
const findWishlistCount = async (bookId) => {
  const result = await db.select({ value: count() }).from(wishlists).where(eq(wishlists.bookId, bookId));
  return result[0]?.value ?? 0;
};
const findWishlistCounts = async (bookIds, range) => {
  if (bookIds.length === 0) return /* @__PURE__ */ new Map();
  const dateFilter = buildCreatedAtFilter(wishlists.createdAt, range);
  const rows = await db.select({
    bookId: wishlists.bookId,
    value: count()
  }).from(wishlists).where(
    dateFilter ? and(inArray(wishlists.bookId, bookIds), dateFilter) : inArray(wishlists.bookId, bookIds)
  ).groupBy(wishlists.bookId);
  const counts = /* @__PURE__ */ new Map();
  for (const id of bookIds) counts.set(id, 0);
  for (const row of rows) counts.set(row.bookId, row.value);
  return counts;
};
const findCollectionCount = async (bookId) => {
  const result = await db.select({ value: count() }).from(collectionItems).where(eq(collectionItems.bookId, bookId));
  return result[0]?.value ?? 0;
};
const findCollectionCounts = async (bookIds, range) => {
  if (bookIds.length === 0) return /* @__PURE__ */ new Map();
  const dateFilter = buildCreatedAtFilter(collectionItems.createdAt, range);
  const rows = await db.select({
    bookId: collectionItems.bookId,
    value: count()
  }).from(collectionItems).where(
    dateFilter ? and(inArray(collectionItems.bookId, bookIds), dateFilter) : inArray(collectionItems.bookId, bookIds)
  ).groupBy(collectionItems.bookId);
  const counts = /* @__PURE__ */ new Map();
  for (const id of bookIds) counts.set(id, 0);
  for (const row of rows) counts.set(row.bookId, row.value);
  return counts;
};
const getCreatorPermissionData = async (creatorId) => {
  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.id, creatorId),
      columns: {
        id: true,
        displayName: true,
        slug: true,
        coverUrl: true
      }
    });
    if (!creator) return err({ reason: "Creator not found" });
    return ok(creator);
  } catch (error) {
    console.error("Failed to get creator permission data", error);
    return err({ reason: "Failed to get creator permission data" });
  }
};
const getBookLikeContext = async (bookId) => {
  try {
    const book = await db.query.books.findFirst({
      where: eq(books.id, bookId),
      columns: {
        id: true,
        artistId: true,
        publisherId: true,
        title: true,
        slug: true,
        coverUrl: true
      },
      with: {
        artist: {
          columns: {
            displayName: true
          }
        }
      }
    });
    return book ? ok(book) : err({ reason: "Book not found" });
  } catch (error) {
    console.error("Failed to get book like context", error);
    return err({ reason: "Failed to get book like context", error });
  }
};
const getBookPermissionData = async (bookId) => {
  try {
    const book = await db.query.books.findFirst({
      where: eq(books.id, bookId),
      columns: {
        id: true,
        artistId: true,
        publisherId: true,
        title: true,
        slug: true,
        coverUrl: true
      },
      with: {
        creatorUser: {
          columns: {
            id: true,
            email: true
          }
        },
        artist: {
          columns: {
            id: true,
            displayName: true
          }
        }
      }
    });
    return book ? ok(book) : err({ reason: "Book not found" });
  } catch (error) {
    console.error("Failed to get book permission data", error);
    return err({ reason: "Failed to get book permission data", error });
  }
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
  try {
    await db.insert(wishlists).values({
      userId,
      bookId
    });
    return ok(void 0);
  } catch (error) {
    console.error("Failed to insert wishlist", error);
    return err({ reason: "Failed to insert wishlist" });
  }
};
const deleteWishlist = async (userId, bookId) => {
  await db.delete(wishlists).where(and(eq(wishlists.userId, userId), eq(wishlists.bookId, bookId)));
};
const searchBooks = async (searchQuery, limit = 5) => {
  try {
    const searchPattern = `%${searchQuery}%`;
    const matchingCreatorIds = db.select({ id: creators.id }).from(creators).where(ilike(creators.displayName, searchPattern));
    const matchingPublisherIds = db.select({ id: creators.id }).from(creators).where(ilike(creators.displayName, searchPattern));
    const foundBooks = await db.query.books.findMany({
      columns: {
        id: true,
        title: true,
        slug: true,
        coverUrl: true
      },
      with: {
        artist: {
          columns: {
            id: true,
            displayName: true
          }
        },
        publisher: {
          columns: {
            id: true,
            displayName: true
          }
        }
      },
      where: and(
        eq(books.publicationStatus, "published"),
        or(
          ilike(books.title, searchPattern),
          inArray(books.artistId, matchingCreatorIds),
          inArray(books.publisherId, matchingPublisherIds),
          sql`EXISTS (
          SELECT 1
          FROM unnest(${books.tags}) AS tag
          WHERE LOWER(tag) LIKE ${searchPattern.toLowerCase()}
        )`
        )
      ),
      orderBy: (books2, { asc }) => [asc(books2.title)],
      limit
    });
    if (foundBooks.length === 0) return ok([]);
    return ok(foundBooks);
  } catch (error) {
    console.error("Failed to search books", error);
    return err({ reason: "Failed to search books", error });
  }
};
const insertBookComment = async (bookId, userId, body) => {
  try {
    const comment = await db.insert(bookComments).values({
      bookId,
      userId,
      body
    }).returning();
    return ok(comment[0] ?? null);
  } catch (error) {
    console.error("Failed to insert book comment", error);
    return err({ reason: "Failed to insert book comment" });
  }
};
const getBookCommentById = async (commentId) => {
  try {
    const comment = await db.query.bookComments.findFirst({
      where: eq(bookComments.id, commentId)
    });
    return ok(comment);
  } catch (error) {
    console.error("Failed to get book comment by id", error);
    return err({ reason: "Failed to get book comment by id" });
  }
};
const deleteBookCommentById = async (commentId) => {
  try {
    await db.delete(bookComments).where(eq(bookComments.id, commentId));
    return ok(void 0);
  } catch (error) {
    console.error("Failed to delete book comment by id", error);
    return err({ reason: "Failed to delete book comment by id" });
  }
};
export {
  deleteBookCommentById,
  deleteFollow,
  deleteLike,
  deleteWishlist,
  findCollectionCount,
  findCollectionCounts,
  findFollow,
  findLike,
  findWishlist,
  findWishlistCount,
  findWishlistCounts,
  getBookCommentById,
  getBookLikeContext,
  getBookPermissionData,
  getCreatorPermissionData,
  insertBookComment,
  insertFollow,
  insertLike,
  insertWishlist,
  searchBooks
};
