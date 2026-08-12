import { asc, eq } from "drizzle-orm";
import { db } from "../../db/client";
import { bookStores, storeImages } from "../../db/schema";
import { err, ok } from "../../lib/result";

export async function getStoreForUpload(storeId: string) {
  try {
    const store = await db.query.bookStores.findFirst({
      where: eq(bookStores.id, storeId),
      with: {
        images: {
          orderBy: [asc(storeImages.sortOrder), asc(storeImages.createdAt)],
        },
      },
    });
    if (!store) return err({ reason: "Store not found" });
    return ok(store);
  } catch (error) {
    console.error("getStoreForUpload", error);
    return err({ reason: "Failed to load store", cause: error });
  }
}

export async function replaceStoreGalleryImages(
  storeId: string,
  imageUrls: string[],
) {
  try {
    await db.transaction(async (tx) => {
      await tx.delete(storeImages).where(eq(storeImages.storeId, storeId));
      if (imageUrls.length > 0) {
        await tx.insert(storeImages).values(
          imageUrls.map((imageUrl, index) => ({
            storeId,
            imageUrl,
            sortOrder: index,
          })),
        );
      }
      // Listing cards / OG use coverUrl — keep in sync with the first gallery shot.
      await tx
        .update(bookStores)
        .set({ coverUrl: imageUrls[0] ?? null, updatedAt: new Date() })
        .where(eq(bookStores.id, storeId));
    });
    return ok(undefined);
  } catch (error) {
    console.error("replaceStoreGalleryImages", error);
    return err({ reason: "Failed to save gallery images", cause: error });
  }
}

export async function updateStoreBannerUrl(storeId: string, bannerUrl: string) {
  try {
    const [updated] = await db
      .update(bookStores)
      .set({ bannerUrl, updatedAt: new Date() })
      .where(eq(bookStores.id, storeId))
      .returning();
    if (!updated) return err({ reason: "Failed to update banner" });
    return ok(updated);
  } catch (error) {
    console.error("updateStoreBannerUrl", error);
    return err({ reason: "Failed to update banner", cause: error });
  }
}
