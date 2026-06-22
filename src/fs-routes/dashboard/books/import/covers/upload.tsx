import { createRoute } from "hono-fsr";
import { Context } from "hono";
import AppLayout from "../../../../../components/layouts/AppLayout";
import Page from "../../../../../components/layouts/Page";
import Breadcrumbs from "../../../../../features/dashboard/admin/components/Breadcrumbs";
import InfoPage from "../../../../../pages/InfoPage";
import { getUser, setFlash } from "../../../../../utils";
import { db } from "../../../../../db/client";
import { books, bookImages } from "../../../../../db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { removeInvalidImages, uploadImage } from "../../../../../services/storage";
import { updateBookCoverImage } from "../../../../../features/dashboard/images/services";

export const POST = createRoute(async (c: Context) => {
  const user = await getUser(c);

  if (!user.creator) {
    return c.html(<InfoPage errorMessage="Creator not found" user={user} />);
  }

  const body = await c.req.parseBody({ all: true });
  const bookIdsJson = String(body.book_ids ?? "[]");

  let bookIds: string[];
  try {
    bookIds = JSON.parse(bookIdsJson);
  } catch {
    await setFlash(c, "danger", "Invalid upload data");
    return c.redirect("/dashboard/books");
  }

  if (bookIds.length === 0) {
    await setFlash(c, "danger", "No books to upload images for");
    return c.redirect("/dashboard/books");
  }

  // Verify books belong to creator
  const creatorBooks = await db
    .select({ id: books.id, title: books.title })
    .from(books)
    .where(
      and(
        inArray(books.id, bookIds),
        user.creator.type === "artist"
          ? eq(books.artistId, user.creator.id)
          : eq(books.publisherId, user.creator.id),
      ),
    );

  const validBookIds = new Set(creatorBooks.map((b) => b.id));
  
  let totalUploaded = 0;
  let failedBooks = 0;

  // Process each book
  for (const bookId of bookIds) {
    if (!validBookIds.has(bookId)) {
      failedBooks++;
      continue;
    }

    const countKey = `book_${bookId}_count`;
    const count = parseInt(String(body[countKey] ?? "0"));

    if (count === 0) continue;

    const imageFiles: File[] = [];
    for (let i = 0; i < count; i++) {
      const key = `book_${bookId}_image_${i}`;
      const file = body[key];
      if (file && removeInvalidImages(file)) {
        imageFiles.push(file as File);
      }
    }

    if (imageFiles.length === 0) {
      failedBooks++;
      continue;
    }

    try {
      // Upload cover (first image)
      const coverFile = imageFiles[0];
      if (coverFile) {
        const coverResult = await uploadImage(
          coverFile,
          `books/covers/${bookId}`,
          "cover",
        );
        const [err] = await updateBookCoverImage(bookId, coverResult.url);
        if (err) {
          failedBooks++;
          continue;
        }
        totalUploaded++;
      }

      // Upload gallery images (rest)
      const galleryFiles = imageFiles.slice(1);
      if (galleryFiles.length > 0) {
        const galleryResults = await Promise.all(
          galleryFiles.map((file) =>
            uploadImage(file, `books/${bookId}/gallery`, "gallery"),
          ),
        );

        await Promise.all(
          galleryResults.map((result, index) =>
            db.insert(bookImages).values({
              bookId,
              imageUrl: result.url,
              sortOrder: index,
            }),
          ),
        );
        totalUploaded += galleryFiles.length;
      }
    } catch (error) {
      console.error(`Failed to upload images for book ${bookId}:`, error);
      failedBooks++;
    }
  }

  await setFlash(
    c,
    totalUploaded > 0 ? "success" : "danger",
    totalUploaded > 0
      ? `Uploaded ${totalUploaded} image${totalUploaded === 1 ? "" : "s"}${failedBooks > 0 ? ` (${failedBooks} book${failedBooks === 1 ? "" : "s"} failed)` : ""}`
      : "Upload failed",
  );

  return c.redirect("/dashboard/books");
});
