import { and, eq } from "drizzle-orm";
import { db } from "../../db/client";
import {
  Book,
  books,
  Creator,
  creators,
  follows,
  FollowTarget,
  wishlists,
} from "../../db/schema";
import { normalizeUrl } from "../../services/verification";

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
): Promise<Pick<Book, "id" | "artistId" | "publisherId" | "title"> | null> => {
  try {
    const book = await db.query.books.findFirst({
      where: eq(books.id, bookId),
      columns: {
        id: true,
        artistId: true,
        publisherId: true,
        title: true,
      },
    });
    return book ?? null;
  } catch (error) {
    console.error("Failed to get book permission data", error);
    return null;
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

export const getCreatorByDisplayName = (displayName: string) =>
  db.query.creators.findFirst({
    where: eq(creators.displayName, displayName),
  });

export const getCreatorByWebsite = (website: string) =>
  db.query.creators.findFirst({
    where: eq(creators.website, normalizeUrl(website)),
  });
