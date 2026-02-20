/**
 * Reports how much storage (bytes / MB / GB) would be freed by deleting
 * all draft books and their accompanying images. No deletions are performed.
 */
import "./env";
import { db } from "../src/db/client";
import { bookImages, books } from "../src/db/schema";
import { eq, inArray } from "drizzle-orm";

const BUCKET_PREFIX = "/storage/v1/object/public/images/";
const DELAY_MS = 100;

function getStoragePathFromPublicUrl(publicUrl: string): string | null {
  const idx = publicUrl.indexOf(BUCKET_PREFIX);
  if (idx === -1) return null;
  return publicUrl.slice(idx + BUCKET_PREFIX.length);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getSizeBytes(url: string): Promise<number | null> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const cl = res.headers.get("content-length");
    if (cl != null) {
      const n = parseInt(cl, 10);
      if (!Number.isNaN(n)) return n;
    }
    const buf = await res.arrayBuffer();
    return buf.byteLength;
  } catch {
    return null;
  }
}

async function main() {
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
    .select({ imageUrl: bookImages.imageUrl })
    .from(bookImages)
    .where(inArray(bookImages.bookId, draftBookIds));

  const urls: string[] = [];
  for (const book of draftBooks) {
    if (book.coverUrl && getStoragePathFromPublicUrl(book.coverUrl))
      urls.push(book.coverUrl);
  }
  for (const row of galleryRows) {
    if (getStoragePathFromPublicUrl(row.imageUrl)) urls.push(row.imageUrl);
  }

  console.log(
    `Draft books: ${draftBooks.length}. Files in our bucket: ${urls.length}. Fetching sizes...\n`,
  );

  let totalBytes = 0;
  let failed = 0;

  for (let i = 0; i < urls.length; i++) {
    const size = await getSizeBytes(urls[i]);
    if (size != null) {
      totalBytes += size;
    } else {
      failed++;
    }
    if ((i + 1) % 50 === 0) {
      console.log(`  ${i + 1}/${urls.length}...`);
    }
    await sleep(DELAY_MS);
  }

  const mb = totalBytes / (1024 * 1024);
  const gb = mb / 1024;

  console.log("\n--- Storage that would be freed ---");
  console.log(`  Total: ${totalBytes.toLocaleString()} bytes`);
  console.log(`  ${mb.toFixed(2)} MB`);
  console.log(`  ${gb.toFixed(2)} GB`);
  if (failed > 0) {
    console.log(`  (${failed} URL(s) could not be measured)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
