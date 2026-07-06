import {
  and,
  count,
  desc,
  eq,
  inArray,
  isNull,
  lte,
  or,
  sql
} from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  bookViews,
  books
} from "../../db/schema.js";
import {
  buildCreatedAtFilter
} from "../book-analytics/dateRange.js";
import { err, ok } from "../../lib/result.js";
import { getPagination } from "../../lib/pagination.js";
const MAX_REFERER_LENGTH = 512;
const recordBookView = async ({
  bookId,
  userId,
  source = "web",
  referer
}) => {
  try {
    const trimmedReferer = referer?.trim().slice(0, MAX_REFERER_LENGTH) ?? null;
    await db.insert(bookViews).values({
      bookId,
      userId: userId ?? null,
      source,
      referer: trimmedReferer
    });
    return ok(void 0);
  } catch (error) {
    console.error("Failed to record book view", error);
    return err({ reason: "Failed to record book view", cause: error });
  }
};
const findBookViewCount = async (bookId) => {
  const result = await db.select({ value: count() }).from(bookViews).where(eq(bookViews.bookId, bookId));
  return result[0]?.value ?? 0;
};
const findBookViewCounts = async (bookIds, range) => {
  if (bookIds.length === 0) return /* @__PURE__ */ new Map();
  const dateFilter = buildCreatedAtFilter(bookViews.createdAt, range);
  const rows = await db.select({
    bookId: bookViews.bookId,
    value: count()
  }).from(bookViews).where(
    dateFilter ? and(inArray(bookViews.bookId, bookIds), dateFilter) : inArray(bookViews.bookId, bookIds)
  ).groupBy(bookViews.bookId);
  const counts = /* @__PURE__ */ new Map();
  for (const id of bookIds) counts.set(id, 0);
  for (const row of rows) counts.set(row.bookId, row.value);
  return counts;
};
const getCreatorBookViewTotal = async (creatorId, role) => {
  const creatorColumn = role === "publisher" ? books.publisherId : books.artistId;
  const result = await db.select({ value: count() }).from(bookViews).innerJoin(books, eq(bookViews.bookId, books.id)).where(eq(creatorColumn, creatorId));
  return result[0]?.value ?? 0;
};
const getCreatorCatalogueBookViewTotal = async (creatorId) => {
  const result = await db.select({ value: count() }).from(bookViews).innerJoin(books, eq(bookViews.bookId, books.id)).where(or(eq(books.artistId, creatorId), eq(books.publisherId, creatorId)));
  return result[0]?.value ?? 0;
};
const getBookViewTotals = async (range) => {
  const dateFilter = buildCreatedAtFilter(bookViews.createdAt, range);
  const [totalViewsResult, booksWithViewsResult] = await Promise.all([
    dateFilter ? db.select({ value: count() }).from(bookViews).where(dateFilter) : db.select({ value: count() }).from(bookViews),
    dateFilter ? db.select({ value: sql`count(distinct ${bookViews.bookId})` }).from(bookViews).where(dateFilter) : db.select({ value: sql`count(distinct ${bookViews.bookId})` }).from(bookViews)
  ]);
  return {
    totalViews: totalViewsResult[0]?.value ?? 0,
    booksWithViews: booksWithViewsResult[0]?.value ?? 0
  };
};
function scopeBookFilter(scope) {
  const column = scope.creatorType === "publisher" ? books.publisherId : books.artistId;
  return eq(column, scope.creatorId);
}
const getTopBooksByViews = async (range, currentPage = 1, defaultLimit = 10, scope) => {
  try {
    const dateFilter = buildCreatedAtFilter(bookViews.createdAt, range);
    const scopeFilter = scope ? scopeBookFilter(scope) : void 0;
    const where = scopeFilter && dateFilter ? and(scopeFilter, dateFilter) : scopeFilter ?? dateFilter;
    const countQuery = scope ? db.select({
      value: sql`count(distinct ${bookViews.bookId})`
    }).from(bookViews).innerJoin(books, eq(bookViews.bookId, books.id)) : db.select({
      value: sql`count(distinct ${bookViews.bookId})`
    }).from(bookViews);
    const [{ value: totalCount = 0 }] = where ? await countQuery.where(where) : await countQuery;
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit
    );
    if (totalCount === 0) {
      return ok({ books: [], totalPages: 1, page: 1 });
    }
    const viewQuery = (scope ? db.select({
      bookId: bookViews.bookId,
      viewCount: count()
    }).from(bookViews).innerJoin(books, eq(bookViews.bookId, books.id)) : db.select({
      bookId: bookViews.bookId,
      viewCount: count()
    }).from(bookViews)).groupBy(bookViews.bookId).orderBy(desc(count())).limit(limit).offset(offset);
    const viewRows = where ? await viewQuery.where(where) : await viewQuery;
    if (viewRows.length === 0) {
      return ok({ books: [], totalPages, page });
    }
    const bookIds = viewRows.map((row) => row.bookId);
    const viewCountByBookId = new Map(
      viewRows.map((row) => [row.bookId, row.viewCount])
    );
    const bookRows = await db.query.books.findMany({
      where: inArray(books.id, bookIds),
      columns: {
        id: true,
        title: true,
        slug: true,
        coverUrl: true
      },
      with: {
        artist: {
          columns: { id: true, displayName: true, slug: true }
        },
        publisher: {
          columns: { id: true, displayName: true, slug: true }
        }
      }
    });
    const bookById = new Map(bookRows.map((book) => [book.id, book]));
    const topBooks = viewRows.map((viewRow) => {
      const book = bookById.get(viewRow.bookId);
      if (!book) return null;
      return {
        bookId: book.id,
        title: book.title,
        slug: book.slug,
        coverUrl: book.coverUrl,
        viewCount: viewCountByBookId.get(book.id) ?? 0,
        artistName: book.artist?.displayName ?? null,
        publisherName: book.publisher?.displayName ?? null
      };
    }).filter((row) => row !== null);
    return ok({ books: topBooks, totalPages, page });
  } catch (error) {
    console.error("Failed to get top books by views", error);
    return err({ reason: "Failed to get top books by views", cause: error });
  }
};
const publishedBookConditions = and(
  eq(books.publicationStatus, "published"),
  eq(books.approvalStatus, "approved"),
  or(isNull(books.releaseDate), lte(books.releaseDate, /* @__PURE__ */ new Date()))
);
export {
  findBookViewCount,
  findBookViewCounts,
  getBookViewTotals,
  getCreatorBookViewTotal,
  getCreatorCatalogueBookViewTotal,
  getTopBooksByViews,
  recordBookView
};
