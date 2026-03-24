import { and, count, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "../../db/client";
import {
  Book,
  bookComments,
  books,
  collectionItems,
  Creator,
  creators,
  follows,
  FollowTarget,
  wishlists,
} from "../../db/schema";
import { err, ok } from "../../lib/result";

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

export const findWishlistCount = async (bookId: string) => {
  const result = await db
    .select({ value: count() })
    .from(wishlists)
    .where(eq(wishlists.bookId, bookId));
  return result[0]?.value ?? 0;
};

export const findCollectionCount = async (bookId: string) => {
  const result = await db
    .select({ value: count() })
    .from(collectionItems)
    .where(eq(collectionItems.bookId, bookId));
  return result[0]?.value ?? 0;
};

export const getCreatorPermissionData = async (
  creatorId: string,
): Promise<Pick<Creator, "id" | "displayName"> | null> => {
  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.id, creatorId),
      columns: {
        id: true,
        displayName: true,
      },
    });
    return creator ?? null;
  } catch (error) {
    console.error("Failed to get creator permission data", error);
    return null;
  }
};

export const getBookPermissionData = async (
  bookId: string,
) => {
  try {
    const book = await db.query.books.findFirst({
      where: eq(books.id, bookId),
      columns: {
        id: true,
        artistId: true,
        publisherId: true,
        title: true,
        slug: true,
      },
    });
    return book ? ok(book) : err({ reason: "Book not found" });
  } catch (error) {
    console.error("Failed to get book permission data", error);
    return err({ reason: "Failed to get book permission data", error });
  }
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

export const searchBooks = async (searchQuery: string) => {
  try {
    const searchPattern = `%${searchQuery}%`;

    // Find creator IDs matching the search
    const matchingCreatorIds = db
      .select({ id: creators.id })
      .from(creators)
      .where(ilike(creators.displayName, searchPattern));

    return await db.query.books.findMany({
      columns: {
        id: true,
        title: true,
        slug: true,
        coverUrl: true,
      },
      with: {
        artist: {
          columns: {
            id: true,
            displayName: true,
          },
        },
        publisher: {
          columns: {
            id: true,
            displayName: true,
          },
        },
      },
      where: and(
        eq(books.publicationStatus, "published"),
        or(
          ilike(books.title, searchPattern),
          inArray(books.artistId, matchingCreatorIds),
          sql`EXISTS (
          SELECT 1
          FROM unnest(${books.tags}) AS tag
          WHERE LOWER(tag) LIKE ${searchPattern.toLowerCase()}
        )`,
        ),
      ),
      orderBy: (books, { asc }) => [asc(books.title)],
      limit: 5,
    });
  } catch (error) {
    console.error("Failed to search books", error);
    return [];
  }
};

export const insertBookComment = async (
  bookId: string,
  userId: string,
  body: string,
) => {
  try {
  await db.insert(bookComments).values({
    bookId,
      userId,
      body,
    });
    return ok(undefined);
  } catch (error) {
    console.error("Failed to insert book comment", error);
    return err({ reason: "Failed to insert book comment" });
  }
};

export const getBookCommentById = async (commentId: string) => {
  try {
    const comment = await db.query.bookComments.findFirst({
      where: eq(bookComments.id, commentId),
    });
    return ok(comment);
  } catch (error) {
    console.error("Failed to get book comment by id", error);
    return err({ reason: "Failed to get book comment by id" });
  }
};

export const deleteBookCommentById = async (commentId: string) => {
  try {
    await db.delete(bookComments).where(eq(bookComments.id, commentId));
    return ok(undefined);
  } catch (error) {
    console.error("Failed to delete book comment by id", error);
    return err({ reason: "Failed to delete book comment by id" });
  }
};