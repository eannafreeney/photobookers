import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../../db/client";
import { bookFairs, bookImages, bookStores, books, creators, users } from "../../../db/schema";
import { err, ok } from "../../../lib/result";
import {
  invalidateBookCache,
  invalidateCreatorCache,
} from "../../app/services";

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

    if (!updatedCreator)
      return err({
        reason: "Failed to update artist cover image",
        cause: undefined,
      });

    if (updatedCreator.slug) {
      invalidateCreatorCache(updatedCreator.slug);
    }

    return ok(updatedCreator);
  } catch (error) {
    console.error("Failed to update artist cover image", error);
    return err({ reason: "Failed to update artist cover image", cause: error });
  }
};

// src/features/dashboard/images/services.ts
export const updateCreatorBannerImage = async (
  bannerUrl: string,
  creatorId: string,
) => {
  try {
    const [updatedCreator] = await db
      .update(creators)
      .set({ bannerUrl })
      .where(eq(creators.id, creatorId))
      .returning();

    if (!updatedCreator) return err({ reason: "Failed to update banner" });

    if (updatedCreator.slug) invalidateCreatorCache(updatedCreator.slug);
    return ok(updatedCreator);
  } catch (error) {
    console.error("Failed to update creator banner image", error);
    return err({
      reason: "Failed to update creator banner image",
    });
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
    if (!updatedUser)
      return err({
        reason: "Failed to update user profile image",
        cause: undefined,
      });
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

    if (!updatedBook)
      return err({
        reason: "Failed to update book cover image",
        cause: undefined,
      });

    if (updatedBook.slug) {
      invalidateBookCache(updatedBook.slug);
    }

    return ok(updatedBook);
  } catch (error) {
    console.error("Failed to update book cover image", error);
    return err({ reason: "Failed to update book cover image", cause: error });
  }
};

export const removeImages = async (bookId: string, removedIds: string[]) =>
  await db
    .delete(bookImages)
    .where(
      and(eq(bookImages.bookId, bookId), inArray(bookImages.id, removedIds)),
    );

export const reorderBookImages = async (
  bookId: string,
  orderedIds: string[],
) => {
  if (!orderedIds.length) return;
  try {
    await db.transaction(async (tx) => {
      for (const [index, imageId] of orderedIds.entries()) {
        await tx
          .update(bookImages)
          .set({ sortOrder: index })
          .where(
            and(eq(bookImages.bookId, bookId), eq(bookImages.id, imageId)),
          );
      }
    });
    return ok(undefined);
  } catch (error) {
    console.error("Failed to reorder book images", error);
    return err({ reason: "Failed to reorder book images", cause: error });
  }
};

export const addBookGalleryImages = async (
  bookId: string,
  imageUrls: string[],
) => {
  try {
    const insertData = imageUrls.map((url, index) => ({
      bookId,
      imageUrl: url,
      sortOrder: index,
    }));

    const inserted = await db.insert(bookImages).values(insertData).returning();
    return ok(inserted);
  } catch (error) {
    console.error("Failed to add book gallery images", error);
    return err({ reason: "Failed to add gallery images", cause: error });
  }
};

export const updateFairCoverImage = async (
  fairId: string,
  coverUrl: string,
) => {
  try {
    const [updatedFair] = await db
      .update(bookFairs)
      .set({ coverUrl })
      .where(eq(bookFairs.id, fairId))
      .returning();

    if (!updatedFair)
      return err({
        reason: "Failed to update fair cover image",
        cause: undefined,
      });

    return ok(updatedFair);
  } catch (error) {
    console.error("Failed to update fair cover image", error);
    return err({ reason: "Failed to update fair cover image", cause: error });
  }
};

export const updateFairBannerImage = async (
  fairId: string,
  bannerUrl: string,
) => {
  try {
    const [updatedFair] = await db
      .update(bookFairs)
      .set({ bannerUrl })
      .where(eq(bookFairs.id, fairId))
      .returning();

    if (!updatedFair)
      return err({
        reason: "Failed to update fair banner image",
        cause: undefined,
      });

    return ok(updatedFair);
  } catch (error) {
    console.error("Failed to update fair banner image", error);
    return err({ reason: "Failed to update fair banner image", cause: error });
  }
};

export const updateStoreCoverImage = async (
  storeId: string,
  coverUrl: string,
) => {
  try {
    const [updatedStore] = await db
      .update(bookStores)
      .set({ coverUrl })
      .where(eq(bookStores.id, storeId))
      .returning();

    if (!updatedStore)
      return err({
        reason: "Failed to update store cover image",
        cause: undefined,
      });

    return ok(updatedStore);
  } catch (error) {
    console.error("Failed to update store cover image", error);
    return err({ reason: "Failed to update store cover image", cause: error });
  }
};
