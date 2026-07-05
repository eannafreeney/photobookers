// import dotenv from "dotenv";
import "./env";
import { join } from "path";
import { downloadAndUploadImage } from "./importImage";

import { readFileSync } from "fs";
import { parse } from "csv/sync";
import { eq, ilike } from "drizzle-orm";
import { db } from "../src/db/client";
import { bookImages, creators, users, books } from "../src/db/schema";
import { createBook } from "../src/features/dashboard/books/services";
import { createStubCreatorProfileAdmin } from "../src/features/dashboard/admin/creators/services";
import { generateUniqueBookSlug, slugify } from "../src/utils";
import { MAX_GALLERY_IMAGES_PER_BOOK } from "../src/constants/images";

const SOURCE_CSV_FILE = "radiusbooks.csv";
const AMOUNT_OF_BOOKS = 100;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeAvailability(
  value: string | undefined,
): "available" | "sold_out" {
  const normalized = (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  return normalized.includes("sold") ? "sold_out" : "available";
}

type CsvRow = {
  title: string;
  artist: string;
  artistExistsInDb: string;
  description: string;
  coverUrl: string;
  images: string;
  availability: string;
  purchaseLink: string;
};

async function getCreatedByUserId(): Promise<string> {
  // const fromEnv = process.env.IMPORT_CREATED_BY_USER_ID;
  // if (fromEnv) return fromEnv;
  const [admin] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.isAdmin, true))
    .limit(1);
  if (!admin)
    throw new Error(
      "No admin user found. Set IMPORT_CREATED_BY_USER_ID or create an admin user.",
    );
  return admin.id;
}

async function getOrCreateArtist(artistName: string, createdByUserId: string) {
  const trimmed = artistName?.trim() || "";
  if (!trimmed) return null;

  const existing = await db
    .select()
    .from(creators)
    .where(ilike(creators.displayName, trimmed))
    .limit(1);

  const creator = existing.find((c) => c.type === "artist");
  if (creator) return creator;

  const [err, created] = await createStubCreatorProfileAdmin(
    trimmed,
    createdByUserId,
    "artist",
  );
  if (err) {
    console.error(`Failed to create artist "${trimmed}": ${err.reason}`);
    return null;
  }
  if (created) return created;

  const bySlug = await db
    .select()
    .from(creators)
    .where(eq(creators.slug, slugify(trimmed)))
    .limit(1);
  return bySlug.find((c) => c.type === "artist") ?? null;
}

function parseImages(imagesCell: string): string[] {
  if (!imagesCell || typeof imagesCell !== "string") return [];
  return imagesCell
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

function optionalEnvUuid(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

async function main() {
  const csvPath =
    process.argv[2] ?? join(process.cwd(), "output", SOURCE_CSV_FILE);

  const createdByUserId = await getCreatedByUserId();
  console.log("Created-by user:", createdByUserId);

  const raw = readFileSync(csvPath, "utf8");
  const firstLine = raw.split("\n")[0] ?? "";
  const delimiter = firstLine.startsWith("title;") ? ";" : ",";
  const rows = parse(raw, {
    delimiter,
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CsvRow[];

  console.log(`Found ${rows.length} rows in CSV.`);

  const rowsToImport = rows.slice(0, AMOUNT_OF_BOOKS);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  const publisherId = optionalEnvUuid(process.env.PUBLISHER_ID);

  for (let rowIndex = 0; rowIndex < rowsToImport.length; rowIndex++) {
    const row = rowsToImport[rowIndex];
    const title = row.title?.trim();
    if (!title) {
      console.warn(`[${rowIndex + 1}] Skipping row: no title`);
      skipped++;
      continue;
    }

    const artist = row.artist?.trim() ?? "";
    const artistCreator = await getOrCreateArtist(artist, createdByUserId);
    if (!artistCreator) {
      console.warn(
        `[${rowIndex + 1}] Skipping "${title}": could not resolve artist "${artist}"`,
      );
      skipped++;
      continue;
    }

    const purchaseLink = row.purchaseLink?.trim() || null;
    if (purchaseLink) {
      const handleMatch = purchaseLink.match(/\/products\/([^/?#]+)/);
      if (handleMatch?.[1]) {
        const [existingByLink] = await db
          .select({ id: books.id })
          .from(books)
          .where(ilike(books.purchaseLink, `%/products/${handleMatch[1]}%`))
          .limit(1);
        if (existingByLink) {
          console.warn(
            `[${rowIndex + 1}] Skipping "${title}": already exists (purchase link)`,
          );
          skipped++;
          continue;
        }
      }
    }

    const slug = await generateUniqueBookSlug(title, artistCreator.displayName);
    const coverUrlRaw = row.coverUrl?.trim() || null;
    const galleryUrls = parseImages(row.images).slice(
      0,
      MAX_GALLERY_IMAGES_PER_BOOK,
    );

    const newBook = await createBook({
      slug,
      title,
      description: row.description?.trim() || null,
      artistId: artistCreator.id,
      publisherId,
      createdByUserId,
      coverUrl: null,
      purchaseLink: purchaseLink,
      images: null,
      availabilityStatus: normalizeAvailability(row.availability),
      approvalStatus: "approved",
      publicationStatus: "draft",
      tags: null,
    });

    if (!newBook) {
      errors++;
      console.error(`[${rowIndex + 1}] Failed to create: ${title}`);
      continue;
    }

    const bookId = newBook.id;
    const folderCover = `books/${bookId}/cover`;
    const folderGallery = `books/${bookId}/gallery`;

    // Download, compress, upload cover; then update book
    let finalCoverUrl: string | null = null;
    if (coverUrlRaw) {
      const newCoverUrl = await downloadAndUploadImage(
        coverUrlRaw,
        folderCover,
        "cover",
      );
      if (newCoverUrl) finalCoverUrl = newCoverUrl;
      await sleep(200);
    }

    // Download, compress, upload each gallery image; then insert into bookImages
    const uploadedGalleryUrls: string[] = [];
    const galleryUrlsToProcess = galleryUrls.slice(
      0,
      MAX_GALLERY_IMAGES_PER_BOOK,
    );

    for (const url of galleryUrlsToProcess) {
      const newUrl = await downloadAndUploadImage(
        url,
        folderGallery,
        "gallery",
      );
      if (newUrl) uploadedGalleryUrls.push(newUrl);
      await sleep(200);
    }
    if (uploadedGalleryUrls.length > 0) {
      await db.insert(bookImages).values(
        uploadedGalleryUrls.map((imageUrl, index) => ({
          bookId,
          imageUrl,
          sortOrder: index,
        })),
      );
    }

    if (finalCoverUrl) {
      await db
        .update(books)
        .set({
          coverUrl: finalCoverUrl,
          publicationStatus: "published",
        })
        .where(eq(books.id, bookId));
    }

    created++;
    console.log(
      `[${rowIndex + 1}/${rowsToImport.length}] Created: ${newBook.title}`,
    );
  }

  console.log(
    `Done. Created: ${created}, skipped: ${skipped}, errors: ${errors}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
