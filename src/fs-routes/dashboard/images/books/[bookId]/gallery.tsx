import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator";
import { requireBookImageEditAccess } from "../../../../../middleware/imageGuards";
import { bookIdSchema } from "../../../../../schemas";
import { BookIdContext } from "../../../../../features/dashboard/books/types";
import {
  removeInvalidImages,
  uploadImages,
} from "../../../../../services/storage";
import {
  removeImages,
  reorderBookImages,
} from "../../../../../features/dashboard/images/services";
import { db } from "../../../../../db/client";
import { bookImages } from "../../../../../db/schema";
import { count, eq } from "drizzle-orm";
import { MAX_GALLERY_IMAGES_PER_BOOK } from "../../../../../constants/images";
import {
  showErrorAlert,
  showSuccessAlert,
} from "../../../../../lib/alertHelpers";

export const POST = createRoute(
  paramValidator(bookIdSchema),
  requireBookImageEditAccess,
  async (c: BookIdContext) => {
    const bookId = c.req.valid("param").bookId;
    const body = await c.req.parseBody({ all: true });

    // 1. Get the uploaded files (body.gallery will be File | File[] or undefined)
    const galleryFiles = body.images
      ? Array.isArray(body.images)
        ? body.images
        : [body.images]
      : [];

    // Filter to valid image files only
    const validFiles = galleryFiles.filter(removeInvalidImages);

    // 2. Parse removed image IDs
    const removedIds: string[] = body.removedIds
      ? JSON.parse(body.removedIds as string)
      : [];

    // 3. Parse ordered image IDs
    const orderedIds: string[] = body.orderedIds
      ? JSON.parse(body.orderedIds as string)
      : [];

    if (orderedIds.length > 0) {
      await reorderBookImages(bookId, orderedIds);
    }

    // --- enforce max gallery images per book ---
    const [{ value: currentCount }] = await db
      .select({ value: count() })
      .from(bookImages)
      .where(eq(bookImages.bookId, bookId));

    const countAfterChanges =
      currentCount - removedIds.length + validFiles.length;
    if (countAfterChanges > MAX_GALLERY_IMAGES_PER_BOOK)
      return showErrorAlert(
        c,
        `Gallery can have at most ${MAX_GALLERY_IMAGES_PER_BOOK} images. Remove some or upload fewer.`,
      );

    // 3. Delete removed images from DB
    if (removedIds.length > 0) {
      await removeImages(bookId, removedIds);
    }

    // 4. Upload new images and save to DB
    try {
      if (validFiles.length > 0) {
        await uploadImages(validFiles, bookId);
      }
    } catch (error) {
      console.log(error, "error in upload images");
      return showErrorAlert(c, "Failed to upload images");
    }

    return showSuccessAlert(c, "Images Updated");
  },
);
