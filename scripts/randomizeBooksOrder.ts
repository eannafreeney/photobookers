/**
 * Assigns a random sort_order to every book in the database.
 * This is a one-time backfill — run it once after applying the migration.
 *
 * Run: npx tsx scripts/randomizeBooksOrder.ts [--dry-run]
 */
import "./env";
import { db } from "../src/db/client";
import { books } from "../src/db/schema";
import { eq } from "drizzle-orm";

const dryRun = process.argv.includes("--dry-run");

async function main() {
  const all = await db.query.books.findMany({
    columns: { id: true, title: true },
  });

  console.log(`Found ${all.length} books.`);

  // Assign each book a unique random integer in [0, N)
  const indices = Array.from({ length: all.length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  if (dryRun) {
    console.log("Dry run — no changes written.");
    all.forEach((book, i) =>
      console.log(`  [${indices[i]}] ${book.title} (${book.id})`),
    );
    return;
  }

  await db.transaction(async (tx) => {
    for (let i = 0; i < all.length; i++) {
      await tx
        .update(books)
        .set({ sortOrder: indices[i] })
        .where(eq(books.id, all[i].id));
    }
  });

  console.log(`Assigned random sort_order to ${all.length} books.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
