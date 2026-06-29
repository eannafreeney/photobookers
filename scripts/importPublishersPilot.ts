/**
 * Create stub publisher profiles and import pilot CSVs from output/.
 *
 * Run: ENV=production npx tsx scripts/importPublishersPilot.ts
 */
import "./env";
import { readFileSync } from "fs";
import { join } from "path";
import { parse } from "csv/sync";
import { eq, ilike } from "drizzle-orm";
import { db } from "../src/db/client";
import { bookImages, books, creators, users } from "../src/db/schema";
import { createBook } from "../src/features/dashboard/books/services";
import { createStubCreatorProfileAdmin } from "../src/features/dashboard/admin/creators/services";
import { generateUniqueBookSlug, slugify } from "../src/utils";
import { MAX_GALLERY_IMAGES_PER_BOOK } from "../src/constants/images";
import { downloadAndUploadImage } from "./importImage";

const PILOT_PUBLISHERS = [
  {
    displayName: "Aperture",
    website: "https://store.aperture.org",
    email: null as string | null,
    csv: "aperture-bestsellers.csv",
  },
  {
    displayName: "Buchkunst Berlin",
    website: "https://www.buchkunst-berlin.de",
    email: "info@buchkunst-berlin.de",
    csv: "buchkunst-berlin.csv",
  },
  {
    displayName: "Alauda Publications",
    website: "https://alaudapublications.nl",
    email: null,
    csv: "alauda.csv",
  },
  {
    displayName: "Datz Press",
    website: "https://datzpress.com",
    email: null,
    csv: "datzpress.csv",
  },
] as const;

type CsvRow = {
  title: string;
  artist: string;
  description: string;
  coverUrl: string;
  images: string;
  availability: string;
  purchaseLink: string;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseImages(imagesCell: string): string[] {
  if (!imagesCell?.trim()) return [];
  return imagesCell
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function getCreatedByUserId(): Promise<string> {
  const fromEnv = process.env.IMPORT_CREATED_BY_USER_ID;
  if (fromEnv) return fromEnv;
  const [admin] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.isAdmin, true))
    .limit(1);
  if (!admin) throw new Error("No admin user found.");
  return admin.id;
}

async function getOrCreatePublisher(
  displayName: string,
  website: string | null,
  email: string | null,
  createdByUserId: string,
) {
  const existing = await db
    .select()
    .from(creators)
    .where(ilike(creators.displayName, displayName))
    .limit(5);

  const found = existing.find((c) => c.type === "publisher");
  if (found) {
    console.log(`  Publisher exists: ${found.displayName} (${found.id})`);
    return found;
  }

  const [err, created] = await createStubCreatorProfileAdmin(
    displayName,
    createdByUserId,
    "publisher",
    website ?? undefined,
    email ?? undefined,
  );
  if (err || !created) {
    throw new Error(`Failed to create publisher "${displayName}": ${err?.reason}`);
  }
  console.log(`  Created publisher: ${created.displayName} (${created.id})`);
  return created;
}

async function getOrCreateArtist(artistName: string, createdByUserId: string) {
  const trimmed = artistName?.trim() || "";
  if (!trimmed) return null;

  const existing = await db
    .select()
    .from(creators)
    .where(ilike(creators.displayName, trimmed))
    .limit(5);

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

async function importCsv(
  csvPath: string,
  publisherId: string,
  createdByUserId: string,
) {
  const raw = readFileSync(csvPath, "utf8");
  const delimiter = raw.split("\n")[0]?.startsWith("title;") ? ";" : ",";
  const rows = parse(raw, {
    delimiter,
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CsvRow[];

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const title = row.title?.trim();
    if (!title) {
      skipped++;
      continue;
    }

    const artistCreator = await getOrCreateArtist(
      row.artist?.trim() ?? "",
      createdByUserId,
    );
    if (!artistCreator) {
      console.warn(`  [${i + 1}] Skip "${title}": no artist`);
      skipped++;
      continue;
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
      purchaseLink: row.purchaseLink?.trim() || null,
      images: null,
      availabilityStatus:
        row.availability?.trim().toLowerCase().includes("sold")
          ? "sold_out"
          : "available",
      approvalStatus: "approved",
      publicationStatus: "draft",
      tags: null,
    });

    if (!newBook) {
      errors++;
      console.error(`  [${i + 1}] Failed: ${title}`);
      continue;
    }

    const bookId = newBook.id;
    let finalCoverUrl: string | null = null;

    if (coverUrlRaw) {
      finalCoverUrl = await downloadAndUploadImage(
        coverUrlRaw,
        `books/${bookId}/cover`,
        "cover",
      );
      await sleep(200);
    }

    const uploadedGalleryUrls: string[] = [];
    for (const url of galleryUrls) {
      const newUrl = await downloadAndUploadImage(
        url,
        `books/${bookId}/gallery`,
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
        .set({ coverUrl: finalCoverUrl, publicationStatus: "published" })
        .where(eq(books.id, bookId));
    }

    created++;
    console.log(`  [${i + 1}/${rows.length}] ${title}`);
  }

  return { created, skipped, errors };
}

async function main() {
  const createdByUserId = await getCreatedByUserId();
  console.log("Admin user:", createdByUserId);

  const only = process.argv.slice(2).map((s) => s.toLowerCase());
  const publishers =
    only.length > 0
      ? PILOT_PUBLISHERS.filter((p) =>
          only.some(
            (o) =>
              p.csv.toLowerCase().includes(o) ||
              p.displayName.toLowerCase().includes(o),
          ),
        )
      : PILOT_PUBLISHERS;

  if (publishers.length === 0) {
    throw new Error(`No publishers matched: ${only.join(", ")}`);
  }

  const summary: Array<{
    publisher: string;
    slug: string;
    created: number;
    skipped: number;
    errors: number;
  }> = [];

  for (const pub of publishers) {
    console.log(`\n=== ${pub.displayName} ===`);
    const publisher = await getOrCreatePublisher(
      pub.displayName,
      pub.website,
      pub.email,
      createdByUserId,
    );

    const csvPath = join(process.cwd(), "output", pub.csv);
    console.log(`Importing ${csvPath}...`);
    const result = await importCsv(csvPath, publisher.id, createdByUserId);
    summary.push({
      publisher: pub.displayName,
      slug: publisher.slug,
      ...result,
    });
    console.log(
      `  Done: created=${result.created}, skipped=${result.skipped}, errors=${result.errors}`,
    );
  }

  console.log("\n=== Summary ===");
  for (const row of summary) {
    console.log(
      `${row.publisher} (/creators/${row.slug}): ${row.created} books, ${row.skipped} skipped, ${row.errors} errors`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
