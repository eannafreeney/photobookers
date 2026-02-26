import { count, eq } from "drizzle-orm";
import Alert from "../../../components/app/Alert";
import { bookImages, Creator } from "../../../db/schema";
import { showErrorAlert, showSuccessAlert } from "../../../lib/alertHelpers";
import { validateImageFile } from "../../../lib/validator";
import {
  removeInvalidImages,
  uploadImage,
  uploadImages,
} from "../../../services/storage";
import { getUser } from "../../../utils";
import { BookIdContext } from "../books/types";
import { CreatorIdContext } from "../creators/types";
import {
  removeImages,
  updateBookCoverImage,
  updateCreatorCoverImage,
} from "./services";
import { MAX_GALLERY_IMAGES_PER_BOOK } from "../../../constants/images";
import { db } from "../../../db/client";

export const updateCreatorCover = async (c: CreatorIdContext) => {
  const creatorId = c.req.valid("param").creatorId;
  const body = await c.req.parseBody();
  const user = await getUser(c);

  const validatedFile = validateImageFile(body.cover);
  if (!validatedFile.success) return showErrorAlert(c, validatedFile.error);

  let coverUrl: string | null = null;
  try {
    const result = await uploadImage(
      validatedFile.file,
      `creators/covers/${creatorId}`,
    );
    coverUrl = result.url;
  } catch (error) {
    return showErrorAlert(c, "Failed to upload image");
  }

  let updatedCreator: Creator | null = null;

  try {
    updatedCreator = await updateCreatorCoverImage(coverUrl, creatorId);
  } catch (error) {
    console.log(error, "error in update creator cover image");
    return showErrorAlert(c, "Failed to update creator cover image");
  }

  return c.html(
    <>
      <Alert
        type="success"
        message={`${updatedCreator?.displayName ?? "Book"} Updated!`}
      />
      <div id="server_events">
        <div x-init="$dispatch('avatar:updated')"></div>
      </div>
    </>,
  );
};

export const updateBookCover = async (c: BookIdContext) => {
  const bookId = c.req.valid("param").bookId;
  const body = await c.req.parseBody();

  const validatedFile = validateImageFile(body.cover);
  if (!validatedFile.success) return showErrorAlert(c, validatedFile.error);

  let coverUrl: string | null = null;
  try {
    const result = await uploadImage(
      validatedFile.file,
      `books/covers/${bookId}`,
    );
    coverUrl = result.url;
  } catch (error) {
    console.log(error, "error in upload cover image");
    return showErrorAlert(c, "Failed to upload cover image");
  }
  const updatedBook = await updateBookCoverImage(bookId, coverUrl);

  if (!updatedBook) return showErrorAlert(c, "Failed to update book cover");

  return showSuccessAlert(c, "Image Updated");
};

export const uploadGalleryImages = async (c: BookIdContext) => {
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

  return showSuccessAlert(c, "ImagesUpdated");
};
