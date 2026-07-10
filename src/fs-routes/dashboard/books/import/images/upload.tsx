import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { and, eq, gte, sql } from "drizzle-orm";
import InfoPage from "../../../../../pages/InfoPage";
import { getUser, setFlash } from "../../../../../utils";
import { removeInvalidImages, uploadImage } from "../../../../../services/storage";
import { updateBookCoverImage, addBookGalleryImages } from "../../../../../features/dashboard/images/services";
import { getBooksForBulkBookImagesUpload } from "../../../../../features/dashboard/books/services";
import { 
  MAX_IMAGES_PER_BOOK, 
  MAX_IMAGE_SIZE_BYTES, 
  MAX_TOTAL_UPLOAD_SIZE_BYTES,
  MAX_BOOKS_FOR_BULK_UPLOAD,
  MAX_IMAGE_UPLOADS_PER_HOUR,
} from "../../../../../features/dashboard/books/import/constants";
import { db } from "../../../../../db/client";
import { books } from "../../../../../db/schema";

/**
 * Check if user has exceeded rate limit for image uploads
 */
async function checkImageUploadRateLimit(userId: string): Promise<boolean> {
  try {
    const oneHourAgo = new Date(Date.now() - 3600000);
    
    // Count recent uploads by checking books with recent cover updates
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(books)
      .where(
        and(
          eq(books.createdByUserId, userId),
          gte(books.updatedAt, oneHourAgo)
        )
      );
    
    const uploadCount = result[0]?.count ?? 0;
    
    // Allow up to MAX_IMAGE_UPLOADS_PER_HOUR bulk upload operations per hour
    // (This is a simplified check - could be more sophisticated with a dedicated uploads table)
    return uploadCount < MAX_IMAGE_UPLOADS_PER_HOUR * MAX_BOOKS_FOR_BULK_UPLOAD;
  } catch (error) {
    console.error("Failed to check image upload rate limit:", error);
    // Allow upload on rate limit check failure to avoid blocking legitimate users
    return true;
  }
}

export const POST = createRoute(async (c: Context) => {
  const user = await getUser(c);

  if (!user.creator) {
    return c.html(<InfoPage errorMessage="Creator not found" user={user} />);
  }

  // VALIDATION #7: Rate limiting check
  const withinRateLimit = await checkImageUploadRateLimit(user.id);
  if (!withinRateLimit) {
    await setFlash(
      c, 
      "danger", 
      "Upload rate limit exceeded. Please try again in an hour."
    );
    return c.redirect("/dashboard");
  }

  const body = await c.req.parseBody({ all: true });
  const bookIdsJson = String(body.book_ids ?? "[]");

  let bookIds: string[];
  try {
    bookIds = JSON.parse(bookIdsJson);
  } catch {
    await setFlash(c, "danger", "Invalid upload data");
    return c.redirect("/dashboard");
  }

  if (bookIds.length === 0) {
    await setFlash(c, "danger", "No books to upload images for");
    return c.redirect("/dashboard");
  }

  // VALIDATION #8: Array length validation (High priority - DoS prevention)
  if (bookIds.length > MAX_BOOKS_FOR_BULK_UPLOAD) {
    await setFlash(
      c, 
      "danger", 
      `Maximum ${MAX_BOOKS_FOR_BULK_UPLOAD} books for bulk upload. You selected ${bookIds.length}.`
    );
    return c.redirect("/dashboard");
  }

  // Verify books belong to creator
  const [booksError, creatorBooks] = await getBooksForBulkBookImagesUpload(bookIds, user);
  if (booksError || !creatorBooks) {
    await setFlash(c, "danger", "Failed to verify book ownership");
    return c.redirect("/dashboard");
  }

  const validBookIds = new Set(creatorBooks.map((b) => b.id));
  
  let totalUploaded = 0;
  let failedBooks = 0;
  const validationErrors: string[] = [];

  // VALIDATION #6: Pre-validate total upload size
  let totalUploadSize = 0;
  const bookImageData: Record<string, { count: number; files: File[]; totalSize: number }> = {};

  for (const bookId of bookIds) {
    if (!validBookIds.has(bookId)) {
      continue;
    }

    const countKey = `book_${bookId}_count`;
    const count = parseInt(String(body[countKey] ?? "0"));

    if (count === 0) continue;

    // VALIDATION #5: Server-side image count validation
    if (count > MAX_IMAGES_PER_BOOK) {
      validationErrors.push(
        `Book ${bookId.substring(0, 8)}... has ${count} images (max ${MAX_IMAGES_PER_BOOK})`
      );
      continue;
    }

    const imageFiles: File[] = [];
    let bookTotalSize = 0;

    for (let i = 0; i < count; i++) {
      const key = `book_${bookId}_image_${i}`;
      const file = body[key];
      
      if (file && removeInvalidImages(file)) {
        const imageFile = file as File;
        
        // VALIDATION #6: Per-image size validation
        if (imageFile.size > MAX_IMAGE_SIZE_BYTES) {
          validationErrors.push(
            `Image ${i + 1} for book ${bookId.substring(0, 8)}... is ${(imageFile.size / 1024 / 1024).toFixed(1)}MB (max ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB)`
          );
          continue;
        }
        
        imageFiles.push(imageFile);
        bookTotalSize += imageFile.size;
      }
    }

    if (imageFiles.length > 0) {
      bookImageData[bookId] = {
        count: imageFiles.length,
        files: imageFiles,
        totalSize: bookTotalSize,
      };
      totalUploadSize += bookTotalSize;
    }
  }

  // VALIDATION #6: Total upload size check
  if (totalUploadSize > MAX_TOTAL_UPLOAD_SIZE_BYTES) {
    const totalSizeMB = (totalUploadSize / 1024 / 1024).toFixed(1);
    const maxSizeMB = MAX_TOTAL_UPLOAD_SIZE_BYTES / 1024 / 1024;
    await setFlash(
      c,
      "danger",
      `Total upload size (${totalSizeMB}MB) exceeds ${maxSizeMB}MB limit. Please upload in smaller batches.`
    );
    return c.redirect("/dashboard");
  }

  // Show validation errors if any
  if (validationErrors.length > 0) {
    await setFlash(
      c,
      "danger",
      `Upload validation failed: ${validationErrors.slice(0, 3).join("; ")}${validationErrors.length > 3 ? ` (and ${validationErrors.length - 3} more)` : ""}`
    );
    return c.redirect("/dashboard");
  }

  // Process validated uploads
  for (const bookId of Object.keys(bookImageData)) {
    const { files: imageFiles } = bookImageData[bookId];

    try {
      // Upload cover (first image)
      const coverFile = imageFiles[0];
      if (coverFile) {
        const coverResult = await uploadImage(
          coverFile,
          `books/covers/${bookId}`,
          "cover",
        );
        const [err] = await updateBookCoverImage(bookId, coverResult.url, {
          actorUserId: user.id,
        });
        if (err) {
          failedBooks++;
          continue;
        }
        totalUploaded++;
      }

      // Upload gallery images (rest)
      const galleryFiles = imageFiles.slice(1);
      if (galleryFiles.length > 0) {
        const galleryResults = [];
        for (const file of galleryFiles) {
          galleryResults.push(
            await uploadImage(file, `books/${bookId}/gallery`, "gallery"),
          );
        }

        const imageUrls = galleryResults.map((r) => r.url);
        const [galleryErr] = await addBookGalleryImages(bookId, imageUrls);
        if (galleryErr) {
          console.error(`Failed to save gallery images for book ${bookId}:`, galleryErr);
          // Don't fail the whole book, cover was uploaded successfully
        } else {
          totalUploaded += galleryFiles.length;
        }
      }
    } catch (error) {
      console.error(`Failed to upload images for book ${bookId}:`, error);
      failedBooks++;
    }
  }

  // #23: Audit logging - Log image upload event
  console.log(`[AUDIT] Image Upload by user ${user.id}: ${totalUploaded} images uploaded for ${bookIds.length} books, ${failedBooks} books failed`);

  await setFlash(
    c,
    totalUploaded > 0 ? "success" : "danger",
    totalUploaded > 0
      ? `Uploaded ${totalUploaded} image${totalUploaded === 1 ? "" : "s"}${failedBooks > 0 ? ` (${failedBooks} book${failedBooks === 1 ? "" : "s"} failed)` : ""}`
      : "Upload failed",
  );

  return c.redirect("/dashboard");
});
