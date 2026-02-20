// scripts/trimGalleryImages.ts
import "./env";
import { db } from "../src/db/client";
import { bookImages } from "../src/db/schema";
import { MAX_GALLERY_IMAGES_PER_BOOK } from "../src/constants/images";
import { eq, sql, asc } from "drizzle-orm";

const BUCKET_PREFIX = "/storage/v1/object/public/images/";

function getStoragePathFromPublicUrl(publicUrl: string): string | null {
  const idx = publicUrl.indexOf(BUCKET_PREFIX);
  if (idx === -1) return null;
  return publicUrl.slice(idx + BUCKET_PREFIX.length);
}

const DRY_RUN = true; // set to false to actually delete

async function main() {
  if (DRY_RUN) {
    console.log("DRY RUN — no storage or DB changes will be made.\n");
  }

  const overLimit = await db
    .select({
      bookId: bookImages.bookId,
      count: sql<number>`count(*)::int`,
    })
    .from(bookImages)
    .groupBy(bookImages.bookId)
    .having(sql`count(*) > ${MAX_GALLERY_IMAGES_PER_BOOK}`);

  if (overLimit.length === 0) {
    console.log(
      "No books have more than",
      MAX_GALLERY_IMAGES_PER_BOOK,
      "gallery images.",
    );
    return;
  }

  console.log(`Found ${overLimit.length} book(s) over the limit.\n`);

  for (const { bookId, count } of overLimit) {
    const rows = await db
      .select({
        id: bookImages.id,
        imageUrl: bookImages.imageUrl,
        sortOrder: bookImages.sortOrder,
      })
      .from(bookImages)
      .where(eq(bookImages.bookId, bookId))
      .orderBy(asc(bookImages.sortOrder), asc(bookImages.createdAt));

    const toRemove = rows.slice(MAX_GALLERY_IMAGES_PER_BOOK);

    console.log(
      `Book ${bookId}: ${count} images (would remove ${toRemove.length}):`,
    );

    for (const row of toRemove) {
      const path = getStoragePathFromPublicUrl(row.imageUrl);
      console.log(
        "  -",
        path ?? row.imageUrl,
        "| book_image id:",
        row.id,
        "| sortOrder:",
        row.sortOrder,
      );
    }

    if (!DRY_RUN) {
      for (const row of toRemove) {
        const path = getStoragePathFromPublicUrl(row.imageUrl);
        if (path) {
          try {
            const { deleteImage } = await import("../src/services/storage");
            await deleteImage(path);
          } catch (e) {
            console.error(`Storage delete failed for ${path}:`, e);
          }
        }
        await db.delete(bookImages).where(eq(bookImages.id, row.id));
      }
      console.log(`  → Removed ${toRemove.length} images.\n`);
    } else {
      console.log("");
    }
  }

  if (DRY_RUN) {
    console.log("Dry run complete. Set DRY_RUN = false to perform deletions.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
