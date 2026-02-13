import dotenv from "dotenv";
import { resolve, join } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.scripts") });
dotenv.config();

import { readFileSync } from "fs";
import { parse } from "csv/sync";
import { eq, ilike } from "drizzle-orm";
import { db } from "../../src/db/client";
import { bookImages, creators, users } from "../../src/db/schema";
import { createBook } from "../../src/services/books";
import { createStubCreatorProfile } from "../../src/services/creators";
import { generateUniqueBookSlug, slugify } from "../../src/utils";

type CsvRow = {
  title: string;
  artist: string;
  artistExistsInDb: string;
  description: string;
  specs: string;
  coverUrl: string;
  images: string;
  availability: string;
  purchaseLink: string;
};

async function getCreatedByUserId(): Promise<string> {
  //   const fromEnv = process.env.IMPORT_CREATED_BY_USER_ID;
  //   if (fromEnv) return fromEnv;
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

  const created = await createStubCreatorProfile(
    trimmed,
    createdByUserId,
    "artist",
  );
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

async function main() {
  const csvPath =
    process.argv[2] ?? join(process.cwd(), "output", "hartmann-books.csv");

  const createdByUserId = await getCreatedByUserId();
  console.log("Created-by user:", createdByUserId);

  const raw = readFileSync(csvPath, "utf8");
  const delimiter = raw.includes(";") ? ";" : ",";
  const rows = parse(raw, {
    delimiter,
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CsvRow[];

  console.log(`Found ${rows.length} rows in CSV.`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
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

    const slug = await generateUniqueBookSlug(title, artistCreator.displayName);
    const images = parseImages(row.images);
    const galleryUrls = parseImages(row.images);

    const newBook = await createBook({
      slug,
      title,
      description: row.description?.trim() || null,
      artistId: artistCreator.id,
      publisherId: process.env.HARTMANN_BOOKS_ID,
      createdByUserId,
      specs: row.specs?.trim() || null,
      coverUrl: row.coverUrl?.trim() || null,
      purchaseLink: row.purchaseLink?.trim() || null,
      images: images.length > 0 ? images : null,
      availabilityStatus: "available",
      approvalStatus: "approved",
      publicationStatus: "published",
      tags: null,
    });

    if (newBook) {
      if (galleryUrls.length > 0) {
        await db.insert(bookImages).values(
          galleryUrls.map((imageUrl, index) => ({
            bookId: newBook.id,
            imageUrl,
            sortOrder: index,
          })),
        );
      }
      created++;
      console.log(`[${rowIndex + 1}/${rows.length}] Created: ${newBook.title}`);
    } else {
      errors++;
      console.error(`[${rowIndex + 1}] Failed to create: ${title}`);
    }
  }

  console.log(
    `Done. Created: ${created}, skipped: ${skipped}, errors: ${errors}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
