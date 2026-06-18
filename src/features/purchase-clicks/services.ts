import { count, desc, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "../../db/client";
import {
  books,
  creators,
  purchaseClicks,
  type CreatorType,
  type PurchaseClickSource,
} from "../../db/schema";
import { err, ok } from "../../lib/result";

const MAX_REFERER_LENGTH = 512;

export type RecordPurchaseClickInput = {
  bookId: string;
  userId?: string | null;
  source?: PurchaseClickSource;
  referer?: string | null;
};

export const recordPurchaseClick = async ({
  bookId,
  userId,
  source = "web",
  referer,
}: RecordPurchaseClickInput) => {
  try {
    const trimmedReferer = referer?.trim().slice(0, MAX_REFERER_LENGTH) ?? null;
    await db.insert(purchaseClicks).values({
      bookId,
      userId: userId ?? null,
      source,
      referer: trimmedReferer,
    });
    return ok(undefined);
  } catch (error) {
    console.error("Failed to record purchase click", error);
    return err({ reason: "Failed to record purchase click", cause: error });
  }
};

export const findPurchaseClickCount = async (bookId: string) => {
  const result = await db
    .select({ value: count() })
    .from(purchaseClicks)
    .where(eq(purchaseClicks.bookId, bookId));
  return result[0]?.value ?? 0;
};

export const findPurchaseClickCounts = async (bookIds: string[]) => {
  if (bookIds.length === 0) return new Map<string, number>();

  const rows = await db
    .select({
      bookId: purchaseClicks.bookId,
      value: count(),
    })
    .from(purchaseClicks)
    .where(inArray(purchaseClicks.bookId, bookIds))
    .groupBy(purchaseClicks.bookId);

  const counts = new Map<string, number>();
  for (const id of bookIds) counts.set(id, 0);
  for (const row of rows) counts.set(row.bookId, row.value);
  return counts;
};

export const getCreatorPurchaseClickTotal = async (
  creatorId: string,
  role: CreatorType,
) => {
  const creatorColumn =
    role === "publisher" ? books.publisherId : books.artistId;

  const result = await db
    .select({ value: count() })
    .from(purchaseClicks)
    .innerJoin(books, eq(purchaseClicks.bookId, books.id))
    .where(eq(creatorColumn, creatorId));

  return result[0]?.value ?? 0;
};

export const getCreatorCataloguePurchaseClickTotal = async (
  creatorId: string,
) => {
  const result = await db
    .select({ value: count() })
    .from(purchaseClicks)
    .innerJoin(books, eq(purchaseClicks.bookId, books.id))
    .where(
      or(eq(books.artistId, creatorId), eq(books.publisherId, creatorId)),
    );

  return result[0]?.value ?? 0;
};

export const getPurchaseClickTotals = async () => {
  const [totalClicksResult, booksWithClicksResult, publishersWithClicksResult] =
    await Promise.all([
      db.select({ value: count() }).from(purchaseClicks),
      db
        .select({ value: sql<number>`count(distinct ${purchaseClicks.bookId})` })
        .from(purchaseClicks),
      db
        .select({
          value: sql<number>`count(distinct ${books.publisherId})`,
        })
        .from(purchaseClicks)
        .innerJoin(books, eq(purchaseClicks.bookId, books.id))
        .where(isNotNullPublisher()),
    ]);

  const artistsWithClicksResult = await db
    .select({
      value: sql<number>`count(distinct ${books.artistId})`,
    })
    .from(purchaseClicks)
    .innerJoin(books, eq(purchaseClicks.bookId, books.id))
    .where(isNotNullArtist());

  const publishersWithClicks = publishersWithClicksResult[0]?.value ?? 0;
  const artistsWithClicks = artistsWithClicksResult[0]?.value ?? 0;

  return {
    totalClicks: totalClicksResult[0]?.value ?? 0,
    booksWithClicks: booksWithClicksResult[0]?.value ?? 0,
    creatorsWithClicks: publishersWithClicks + artistsWithClicks,
  };
};

function isNotNullPublisher() {
  return sql`${books.publisherId} IS NOT NULL`;
}

function isNotNullArtist() {
  return sql`${books.artistId} IS NOT NULL`;
}

export const getTopBooksByClicks = async (limit = 25) => {
  try {
    const clickRows = await db
      .select({
        bookId: purchaseClicks.bookId,
        clickCount: count(),
      })
      .from(purchaseClicks)
      .groupBy(purchaseClicks.bookId)
      .orderBy(desc(count()))
      .limit(limit);

    if (clickRows.length === 0) return ok([]);

    const bookIds = clickRows.map((row) => row.bookId);
    const clickCountByBookId = new Map(
      clickRows.map((row) => [row.bookId, row.clickCount]),
    );

    const bookRows = await db.query.books.findMany({
      where: inArray(books.id, bookIds),
      columns: {
        id: true,
        title: true,
        slug: true,
        coverUrl: true,
      },
      with: {
        artist: {
          columns: { id: true, displayName: true, slug: true },
        },
        publisher: {
          columns: { id: true, displayName: true, slug: true },
        },
      },
    });

    const bookById = new Map(bookRows.map((book) => [book.id, book]));

    const rows = clickRows
      .map((clickRow) => {
        const book = bookById.get(clickRow.bookId);
        if (!book) return null;
        return {
          bookId: book.id,
          title: book.title,
          slug: book.slug,
          coverUrl: book.coverUrl,
          clickCount: clickCountByBookId.get(book.id) ?? 0,
          artistName: book.artist?.displayName ?? null,
          publisherName: book.publisher?.displayName ?? null,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    return ok(rows);
  } catch (error) {
    console.error("Failed to get top books by clicks", error);
    return err({ reason: "Failed to get top books by clicks", cause: error });
  }
};

export const getTopCreatorsByClicks = async (
  role: Extract<CreatorType, "artist" | "publisher">,
  limit = 25,
) => {
  try {
    const creatorColumn =
      role === "publisher" ? books.publisherId : books.artistId;

    const rows = await db
      .select({
        creatorId: creators.id,
        displayName: creators.displayName,
        slug: creators.slug,
        coverUrl: creators.coverUrl,
        clickCount: count(purchaseClicks.id),
      })
      .from(purchaseClicks)
      .innerJoin(books, eq(purchaseClicks.bookId, books.id))
      .innerJoin(creators, eq(creatorColumn, creators.id))
      .groupBy(
        creators.id,
        creators.displayName,
        creators.slug,
        creators.coverUrl,
      )
      .orderBy(desc(count(purchaseClicks.id)))
      .limit(limit);

    return ok(rows);
  } catch (error) {
    console.error("Failed to get top creators by clicks", error);
    return err({ reason: "Failed to get top creators by clicks", cause: error });
  }
};
