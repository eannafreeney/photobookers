import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../../db/client";
import { bookImages, books, creators, users } from "../../../db/schema";
import { err, ok } from "../../../lib/result";

export const updateCreatorCoverImage = async (
  coverUrl: string,
  creatorId: string,
) => {
  try {
    const [updatedCreator] = await db
      .update(creators)
      .set({ coverUrl })
      .where(eq(creators.id, creatorId))
      .returning();
    return updatedCreator;
  } catch (error) {
    console.error("Failed to update artist cover image", error);
    return null;
  }
};

export const updateUserProfileImageDB = async (
  userId: string,
  profileImageUrl: string,
) => {
  try {
    const [updatedUser] = await db
      .update(users)
      .set({ profileImageUrl })
      .where(eq(users.id, userId))
      .returning();
    if (!updatedUser) return err({ reason: "Failed to update user profile image", cause: undefined });
    return ok(updatedUser);
  } catch (error) {
    console.error("Failed to update user profile image", error);
    return err({ reason: "Failed to update user profile image", cause: error });
  }
};

export const updateBookCoverImage = async (
  bookId: string,
  coverUrl: string,
) => {
  try {
    const [updatedBook] = await db
      .update(books)
      .set({ coverUrl })
      .where(eq(books.id, bookId))
      .returning();
    return updatedBook;
  } catch (error) {
    console.error("Failed to update book cover image", error);
    return null;
  }
};

export const removeImages = async (bookId: string, removedIds: string[]) =>
  await db
    .delete(bookImages)
    .where(
      and(eq(bookImages.bookId, bookId), inArray(bookImages.id, removedIds)),
    );
