import { and, desc, eq, isNull, lte, or } from "drizzle-orm";
import { db } from "../../../db/client.js";
import { books } from "../../../db/schema.js";
async function getCreatorBookCoverUrls(creatorType, creatorId, limit = 3) {
  const column = creatorType === "publisher" ? books.publisherId : books.artistId;
  const rows = await db.query.books.findMany({
    columns: { coverUrl: true },
    where: and(
      eq(column, creatorId),
      eq(books.publicationStatus, "published"),
      eq(books.approvalStatus, "approved"),
      or(isNull(books.releaseDate), lte(books.releaseDate, /* @__PURE__ */ new Date()))
    ),
    orderBy: [desc(books.releaseDate), desc(books.createdAt)],
    limit
  });
  return rows.map((row) => row.coverUrl).filter((url) => Boolean(url));
}
export {
  getCreatorBookCoverUrls
};
