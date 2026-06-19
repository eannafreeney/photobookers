import { and, count, desc, eq, inArray, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "../../db/client";
import {
  bookViews,
  books,
  creators,
  type BookViewSource,
  type CreatorType,
} from "../../db/schema";
import {
  buildCreatedAtFilter,
  type AnalyticsDateRange,
} from "../book-analytics/dateRange";
import { err, ok } from "../../lib/result";
import {
  CREATOR_CARD_COLUMNS,
  type CreatorCardResult,
} from "../../constants/queries";

const MAX_REFERER_LENGTH = 512;

export type RecordBookViewInput = {
  bookId: string;
  userId?: string | null;
  source?: BookViewSource;
  referer?: string | null;
};

export const recordBookView = async ({
  bookId,
  userId,
  source = "web",
  referer,
}: RecordBookViewInput) => {
  try {
    const trimmedReferer = referer?.trim().slice(0, MAX_REFERER_LENGTH) ?? null;
    await db.insert(bookViews).values({
      bookId,
      userId: userId ?? null,
      source,
      referer: trimmedReferer,
    });
    return ok(undefined);
  } catch (error) {
    console.error("Failed to record book view", error);
    return err({ reason: "Failed to record book view", cause: error });
  }
};

export const findBookViewCount = async (bookId: string) => {
  const result = await db
    .select({ value: count() })
    .from(bookViews)
    .where(eq(bookViews.bookId, bookId));
  return result[0]?.value ?? 0;
};

export const findBookViewCounts = async (
  bookIds: string[],
  range?: AnalyticsDateRange | null,
) => {
  if (bookIds.length === 0) return new Map<string, number>();

  const dateFilter = buildCreatedAtFilter(bookViews.createdAt, range);
  const rows = await db
    .select({
      bookId: bookViews.bookId,
      value: count(),
    })
    .from(bookViews)
    .where(
      dateFilter
        ? and(inArray(bookViews.bookId, bookIds), dateFilter)
        : inArray(bookViews.bookId, bookIds),
    )
    .groupBy(bookViews.bookId);

  const counts = new Map<string, number>();
  for (const id of bookIds) counts.set(id, 0);
  for (const row of rows) counts.set(row.bookId, row.value);
  return counts;
};

export const getCreatorBookViewTotal = async (
  creatorId: string,
  role: CreatorType,
) => {
  const creatorColumn =
    role === "publisher" ? books.publisherId : books.artistId;

  const result = await db
    .select({ value: count() })
    .from(bookViews)
    .innerJoin(books, eq(bookViews.bookId, books.id))
    .where(eq(creatorColumn, creatorId));

  return result[0]?.value ?? 0;
};

export const getCreatorCatalogueBookViewTotal = async (creatorId: string) => {
  const result = await db
    .select({ value: count() })
    .from(bookViews)
    .innerJoin(books, eq(bookViews.bookId, books.id))
    .where(
      or(eq(books.artistId, creatorId), eq(books.publisherId, creatorId)),
    );

  return result[0]?.value ?? 0;
};

export const getBookViewTotals = async (range?: AnalyticsDateRange | null) => {
  const dateFilter = buildCreatedAtFilter(bookViews.createdAt, range);
  const [totalViewsResult, booksWithViewsResult] = await Promise.all([
    dateFilter
      ? db.select({ value: count() }).from(bookViews).where(dateFilter)
      : db.select({ value: count() }).from(bookViews),
    dateFilter
      ? db
          .select({ value: sql<number>`count(distinct ${bookViews.bookId})` })
          .from(bookViews)
          .where(dateFilter)
      : db
          .select({ value: sql<number>`count(distinct ${bookViews.bookId})` })
          .from(bookViews),
  ]);

  return {
    totalViews: totalViewsResult[0]?.value ?? 0,
    booksWithViews: booksWithViewsResult[0]?.value ?? 0,
  };
};

export const getTopBooksByViews = async (
  limit = 25,
  range?: AnalyticsDateRange | null,
) => {
  try {
    const dateFilter = buildCreatedAtFilter(bookViews.createdAt, range);
    const viewQuery = db
      .select({
        bookId: bookViews.bookId,
        viewCount: count(),
      })
      .from(bookViews)
      .groupBy(bookViews.bookId)
      .orderBy(desc(count()))
      .limit(limit);

    const viewRows = dateFilter
      ? await viewQuery.where(dateFilter)
      : await viewQuery;

    if (viewRows.length === 0) return ok([]);

    const bookIds = viewRows.map((row) => row.bookId);
    const viewCountByBookId = new Map(
      viewRows.map((row) => [row.bookId, row.viewCount]),
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

    const rows = viewRows
      .map((viewRow) => {
        const book = bookById.get(viewRow.bookId);
        if (!book) return null;
        return {
          bookId: book.id,
          title: book.title,
          slug: book.slug,
          coverUrl: book.coverUrl,
          viewCount: viewCountByBookId.get(book.id) ?? 0,
          artistName: book.artist?.displayName ?? null,
          publisherName: book.publisher?.displayName ?? null,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    return ok(rows);
  } catch (error) {
    console.error("Failed to get top books by views", error);
    return err({ reason: "Failed to get top books by views", cause: error });
  }
};

const publishedBookConditions = and(
  eq(books.publicationStatus, "published"),
  eq(books.approvalStatus, "approved"),
  or(isNull(books.releaseDate), lte(books.releaseDate, new Date())),
);

export const getTopCreatorsByViews = async (
  limit = 10,
  range?: AnalyticsDateRange | null,
) => {
  try {
    const dateFilter = buildCreatedAtFilter(bookViews.createdAt, range);
    const viewQuery = db
      .select({
        creatorId: creators.id,
        viewCount: count(bookViews.id),
      })
      .from(bookViews)
      .innerJoin(books, eq(bookViews.bookId, books.id))
      .innerJoin(
        creators,
        or(eq(creators.id, books.artistId), eq(creators.id, books.publisherId)),
      )
      .where(
        dateFilter
          ? and(publishedBookConditions, dateFilter)
          : publishedBookConditions,
      )
      .groupBy(creators.id)
      .orderBy(desc(count(bookViews.id)))
      .limit(limit);

    const viewRows = await viewQuery;

    if (viewRows.length === 0) return ok([]);

    const creatorIds = viewRows.map((row) => row.creatorId);
    const creatorRows = await db.query.creators.findMany({
      where: inArray(creators.id, creatorIds),
      columns: CREATOR_CARD_COLUMNS,
    });

    const creatorById = new Map(creatorRows.map((creator) => [creator.id, creator]));

    const rows = viewRows
      .map((viewRow) => creatorById.get(viewRow.creatorId))
      .filter((creator): creator is CreatorCardResult => creator !== undefined);

    return ok(rows);
  } catch (error) {
    console.error("Failed to get top creators by views", error);
    return err({ reason: "Failed to get top creators by views", cause: error });
  }
};
