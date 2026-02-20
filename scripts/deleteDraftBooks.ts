/**
 * Deletes all books where publication_status = 'draft', and their
 * accompanying gallery images and cover image files in Supabase storage.
 */
import "./env";
import { db } from "../src/db/client";
import { bookImages, books } from "../src/db/schema";
import { deleteImage } from "../src/services/storage";
import { eq, inArray } from "drizzle-orm";

const BUCKET_PREFIX = "/storage/v1/object/public/images/";

const DRY_RUN = false; // set to false to actually delete

function getStoragePathFromPublicUrl(publicUrl: string): string | null {
  const idx = publicUrl.indexOf(BUCKET_PREFIX);
  if (idx === -1) return null;
  return publicUrl.slice(idx + BUCKET_PREFIX.length);
}

async function main() {
  if (DRY_RUN) {
    console.log("DRY RUN — no storage or DB changes will be made.\n");
  }

  const draftBooks = await db
    .select({ id: books.id, title: books.title, coverUrl: books.coverUrl })
    .from(books)
    .where(eq(books.publicationStatus, "draft"));

  if (draftBooks.length === 0) {
    console.log("No draft books found.");
    return;
  }

  const draftBookIds = draftBooks.map((b) => b.id);

  const galleryRows = await db
    .select({
      id: bookImages.id,
      bookId: bookImages.bookId,
      imageUrl: bookImages.imageUrl,
    })
    .from(bookImages)
    .where(inArray(bookImages.bookId, draftBookIds));

  console.log(
    `Found ${draftBooks.length} draft book(s) and ${galleryRows.length} gallery image(s).\n`,
  );

  // 1. Delete gallery image files from storage
  for (const row of galleryRows) {
    const path = getStoragePathFromPublicUrl(row.imageUrl);
    if (path) {
      if (DRY_RUN) {
        console.log(`Would delete gallery file: ${path}`);
      } else {
        try {
          await deleteImage(path);
        } catch (e) {
          console.error(`Failed to delete ${path}:`, e);
        }
      }
    }
  }

  // 2. Delete cover image files from storage
  for (const book of draftBooks) {
    if (!book.coverUrl) continue;
    const path = getStoragePathFromPublicUrl(book.coverUrl);
    if (path) {
      if (DRY_RUN) {
        console.log(`Would delete cover: ${path}`);
      } else {
        try {
          await deleteImage(path);
        } catch (e) {
          console.error(`Failed to delete cover ${path}:`, e);
        }
      }
    }
  }

  // 3. Delete the books (cascade deletes book_images rows)
  if (!DRY_RUN) {
    await db.delete(books).where(inArray(books.id, draftBookIds));
    console.log(
      `Deleted ${draftBooks.length} draft book(s) (and their book_images rows).`,
    );
  } else {
    console.log("\nDraft books that would be deleted:");
    draftBooks.forEach((b) => console.log(`  - ${b.title} (${b.id})`));
    console.log("\nSet DRY_RUN = false to perform deletions.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
