import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../../db/client.js";
import { bookFairs, bookImages, bookStores, books, creators, users } from "../../../db/schema.js";
import { err, ok } from "../../../lib/result.js";
import {
  invalidateBookCache,
  invalidateCreatorCache
} from "../../app/services.js";
const updateCreatorCoverImage = async (coverUrl, creatorId) => {
  try {
    const [updatedCreator] = await db.update(creators).set({ coverUrl }).where(eq(creators.id, creatorId)).returning();
    if (!updatedCreator)
      return err({
        reason: "Failed to update artist cover image",
        cause: void 0
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
const updateCreatorBannerImage = async (bannerUrl, creatorId) => {
  try {
    const [updatedCreator] = await db.update(creators).set({ bannerUrl }).where(eq(creators.id, creatorId)).returning();
    if (!updatedCreator) return err({ reason: "Failed to update banner" });
    if (updatedCreator.slug) invalidateCreatorCache(updatedCreator.slug);
    return ok(updatedCreator);
  } catch (error) {
    console.error("Failed to update creator banner image", error);
    return err({
      reason: "Failed to update creator banner image"
    });
  }
};
const updateUserProfileImageDB = async (userId, profileImageUrl) => {
  try {
    const [updatedUser] = await db.update(users).set({ profileImageUrl }).where(eq(users.id, userId)).returning();
    if (!updatedUser)
      return err({
        reason: "Failed to update user profile image",
        cause: void 0
      });
    return ok(updatedUser);
  } catch (error) {
    console.error("Failed to update user profile image", error);
    return err({ reason: "Failed to update user profile image", cause: error });
  }
};
const updateBookCoverImage = async (bookId, coverUrl) => {
  try {
    const [updatedBook] = await db.update(books).set({ coverUrl }).where(eq(books.id, bookId)).returning();
    if (!updatedBook)
      return err({
        reason: "Failed to update book cover image",
        cause: void 0
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
const removeImages = async (bookId, removedIds) => await db.delete(bookImages).where(
  and(eq(bookImages.bookId, bookId), inArray(bookImages.id, removedIds))
);
const reorderBookImages = async (bookId, orderedIds) => {
  if (!orderedIds.length) return;
  try {
    await db.transaction(async (tx) => {
      for (const [index, imageId] of orderedIds.entries()) {
        await tx.update(bookImages).set({ sortOrder: index }).where(
          and(eq(bookImages.bookId, bookId), eq(bookImages.id, imageId))
        );
      }
    });
    return ok(void 0);
  } catch (error) {
    console.error("Failed to reorder book images", error);
    return err({ reason: "Failed to reorder book images", cause: error });
  }
};
const addBookGalleryImages = async (bookId, imageUrls) => {
  try {
    const insertData = imageUrls.map((url, index) => ({
      bookId,
      imageUrl: url,
      sortOrder: index
    }));
    const inserted = await db.insert(bookImages).values(insertData).returning();
    return ok(inserted);
  } catch (error) {
    console.error("Failed to add book gallery images", error);
    return err({ reason: "Failed to add gallery images", cause: error });
  }
};
const updateFairCoverImage = async (fairId, coverUrl) => {
  try {
    const [updatedFair] = await db.update(bookFairs).set({ coverUrl }).where(eq(bookFairs.id, fairId)).returning();
    if (!updatedFair)
      return err({
        reason: "Failed to update fair cover image",
        cause: void 0
      });
    return ok(updatedFair);
  } catch (error) {
    console.error("Failed to update fair cover image", error);
    return err({ reason: "Failed to update fair cover image", cause: error });
  }
};
const updateFairBannerImage = async (fairId, bannerUrl) => {
  try {
    const [updatedFair] = await db.update(bookFairs).set({ bannerUrl }).where(eq(bookFairs.id, fairId)).returning();
    if (!updatedFair)
      return err({
        reason: "Failed to update fair banner image",
        cause: void 0
      });
    return ok(updatedFair);
  } catch (error) {
    console.error("Failed to update fair banner image", error);
    return err({ reason: "Failed to update fair banner image", cause: error });
  }
};
const updateStoreCoverImage = async (storeId, coverUrl) => {
  try {
    const [updatedStore] = await db.update(bookStores).set({ coverUrl }).where(eq(bookStores.id, storeId)).returning();
    if (!updatedStore)
      return err({
        reason: "Failed to update store cover image",
        cause: void 0
      });
    return ok(updatedStore);
  } catch (error) {
    console.error("Failed to update store cover image", error);
    return err({ reason: "Failed to update store cover image", cause: error });
  }
};
export {
  addBookGalleryImages,
  removeImages,
  reorderBookImages,
  updateBookCoverImage,
  updateCreatorBannerImage,
  updateCreatorCoverImage,
  updateFairBannerImage,
  updateFairCoverImage,
  updateStoreCoverImage,
  updateUserProfileImageDB
};
