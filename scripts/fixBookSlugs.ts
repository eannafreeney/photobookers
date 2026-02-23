/**
 * One-off script: regenerate book slugs to include artist name
 * (e.g. "tbilisi-diary" -> "tbilisi-diary-peter-balobrzeski").
 * Uses existing artist relation; books without an artist keep title-only slug.
 */
import "./env";
import { and, eq, ne } from "drizzle-orm";
import { db } from "../src/db/client";
import { books } from "../src/db/schema";
import { slugify } from "../src/utils";

const DRY_RUN = false;

async function generateUniqueBookSlugExcluding(
  title: string,
  artistName: string | undefined,
  excludeBookId: string,
): Promise<string> {
  let baseSlug = slugify(title, artistName);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db
      .select({ id: books.id })
      .from(books)
      .where(and(eq(books.slug, slug), ne(books.id, excludeBookId)))
      .limit(1);

    if (existing.length === 0) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

async function main() {
  if (DRY_RUN) {
    console.log("DRY RUN — no DB updates. Run without --dry-run to apply.\n");
  }

  const allBooks = await db.query.books.findMany({
    columns: { id: true, slug: true, title: true, artistId: true },
    with: { artist: { columns: { displayName: true } } },
  });

  let updated = 0;
  let skipped = 0;

  for (const book of allBooks) {
    const artistName = book.artist?.displayName ?? undefined;
    const newSlug = await generateUniqueBookSlugExcluding(
      book.title,
      artistName,
      book.id,
    );

    if (newSlug === book.slug) {
      skipped++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`[dry-run] ${book.title}: "${book.slug}" -> "${newSlug}"`);
    } else {
      await db
        .update(books)
        .set({ slug: newSlug })
        .where(eq(books.id, book.id));
      console.log(`Updated: "${book.slug}" -> "${newSlug}" (${book.title})`);
    }
    updated++;
  }

  console.log(`\nDone. ${updated} slug(s) updated, ${skipped} unchanged.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
