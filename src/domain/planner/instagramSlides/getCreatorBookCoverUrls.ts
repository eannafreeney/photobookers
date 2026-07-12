import { and, desc, eq, isNull, lte, or } from "drizzle-orm";
import { db } from "../../../db/client";
import { books } from "../../../db/schema";

export async function getCreatorBookCoverUrls(
  creatorType: "artist" | "publisher",
  creatorId: string,
  limit = 3,
): Promise<string[]> {
  const column =
    creatorType === "publisher" ? books.publisherId : books.artistId;

  const rows = await db.query.books.findMany({
    columns: { coverUrl: true },
    where: and(
      eq(column, creatorId),
      eq(books.publicationStatus, "published"),
      eq(books.approvalStatus, "approved"),
      or(isNull(books.releaseDate), lte(books.releaseDate, new Date())),
    ),
    orderBy: [desc(books.releaseDate), desc(books.createdAt)],
    limit,
  });

  return rows
    .map((row) => row.coverUrl)
    .filter((url): url is string => Boolean(url));
}
