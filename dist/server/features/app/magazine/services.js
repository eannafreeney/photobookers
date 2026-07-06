import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../../db/client.js";
import { books } from "../../../db/schema.js";
import {
  BOOK_CARD_COLUMNS,
  CREATOR_CARD_COLUMNS
} from "../../../constants/queries.js";
import { err, ok } from "../../../lib/result.js";
async function getMagazineBooksBySlugs(slugs) {
  if (slugs.length === 0) return ok([]);
  try {
    const found = await db.query.books.findMany({
      where: and(
        eq(books.publicationStatus, "published"),
        inArray(books.slug, slugs)
      ),
      columns: BOOK_CARD_COLUMNS,
      with: {
        artist: { columns: CREATOR_CARD_COLUMNS },
        publisher: { columns: CREATOR_CARD_COLUMNS }
      }
    });
    const bySlug = new Map(found.map((book) => [book.slug, book]));
    return ok(slugs.map((slug) => bySlug.get(slug) ?? null));
  } catch (error) {
    console.error("Failed to load magazine books", error);
    return err({ reason: "Failed to load magazine books", error });
  }
}
export {
  getMagazineBooksBySlugs
};
