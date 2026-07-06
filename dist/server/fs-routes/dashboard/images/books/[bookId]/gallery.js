import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator.js";
import { requireBookImageEditAccess } from "../../../../../middleware/imageGuards.js";
import { bookIdSchema } from "../../../../../schemas/index.js";
import {
  removeInvalidImages,
  uploadImages
} from "../../../../../services/storage.js";
import {
  removeImages,
  reorderBookImages
} from "../../../../../features/dashboard/images/services.js";
import { db } from "../../../../../db/client.js";
import { bookImages } from "../../../../../db/schema.js";
import { count, eq } from "drizzle-orm";
import { MAX_GALLERY_IMAGES_PER_BOOK } from "../../../../../constants/images.js";
import {
  showErrorAlert,
  showSuccessAlert
} from "../../../../../lib/alertHelpers.js";
const POST = createRoute(
  paramValidator(bookIdSchema),
  requireBookImageEditAccess,
  async (c) => {
    const bookId = c.req.valid("param").bookId;
    const body = await c.req.parseBody({ all: true });
    const galleryFiles = body.images ? Array.isArray(body.images) ? body.images : [body.images] : [];
    const validFiles = galleryFiles.filter(removeInvalidImages);
    const removedIds = body.removedIds ? JSON.parse(body.removedIds) : [];
    const orderedIds = body.orderedIds ? JSON.parse(body.orderedIds) : [];
    if (orderedIds.length > 0) {
      await reorderBookImages(bookId, orderedIds);
    }
    const [{ value: currentCount }] = await db.select({ value: count() }).from(bookImages).where(eq(bookImages.bookId, bookId));
    const countAfterChanges = currentCount - removedIds.length + validFiles.length;
    if (countAfterChanges > MAX_GALLERY_IMAGES_PER_BOOK)
      return showErrorAlert(
        c,
        `Gallery can have at most ${MAX_GALLERY_IMAGES_PER_BOOK} images. Remove some or upload fewer.`
      );
    if (removedIds.length > 0) {
      await removeImages(bookId, removedIds);
    }
    try {
      if (validFiles.length > 0) {
        await uploadImages(validFiles, bookId);
      }
    } catch (error) {
      console.log(error, "error in upload images");
      return showErrorAlert(c, "Failed to upload images");
    }
    return showSuccessAlert(c, "Images Updated");
  }
);
export {
  POST
};
