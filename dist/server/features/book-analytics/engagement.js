import { and, count, desc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { books, creators, follows, wishlists } from "../../db/schema.js";
import { err, ok } from "../../lib/result.js";
import { getPagination } from "../../lib/pagination.js";
import {
  buildCreatedAtFilter
} from "./dateRange.js";
function scopeBookFilter(scope) {
  const column = scope.creatorType === "publisher" ? books.publisherId : books.artistId;
  return eq(column, scope.creatorId);
}
const getTopBooksByFavorites = async (range, currentPage = 1, defaultLimit = 10, scope) => {
  try {
    const dateFilter = buildCreatedAtFilter(wishlists.createdAt, range);
    const scopeFilter = scope ? scopeBookFilter(scope) : void 0;
    const where = scopeFilter && dateFilter ? and(scopeFilter, dateFilter) : scopeFilter ?? dateFilter;
    const countQuery = scope ? db.select({
      value: sql`count(distinct ${wishlists.bookId})`
    }).from(wishlists).innerJoin(books, eq(wishlists.bookId, books.id)) : db.select({
      value: sql`count(distinct ${wishlists.bookId})`
    }).from(wishlists);
    const [{ value: totalCount = 0 }] = where ? await countQuery.where(where) : await countQuery;
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit
    );
    if (totalCount === 0) {
      return ok({ books: [], totalPages: 1, page: 1 });
    }
    const favoriteQuery = (scope ? db.select({
      bookId: wishlists.bookId,
      favoriteCount: count()
    }).from(wishlists).innerJoin(books, eq(wishlists.bookId, books.id)) : db.select({
      bookId: wishlists.bookId,
      favoriteCount: count()
    }).from(wishlists)).groupBy(wishlists.bookId).orderBy(desc(count())).limit(limit).offset(offset);
    const favoriteRows = where ? await favoriteQuery.where(where) : await favoriteQuery;
    if (favoriteRows.length === 0) {
      return ok({ books: [], totalPages, page });
    }
    const bookIds = favoriteRows.map((row) => row.bookId);
    const favoriteCountByBookId = new Map(
      favoriteRows.map((row) => [row.bookId, row.favoriteCount])
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
    const topBooks = favoriteRows.map((favoriteRow) => {
      const book = bookById.get(favoriteRow.bookId);
      if (!book) return null;
      return {
        bookId: book.id,
        title: book.title,
        slug: book.slug,
        coverUrl: book.coverUrl,
        favoriteCount: favoriteCountByBookId.get(book.id) ?? 0,
        artistName: book.artist?.displayName ?? null,
        publisherName: book.publisher?.displayName ?? null
      };
    }).filter((row) => row !== null);
    return ok({ books: topBooks, totalPages, page });
  } catch (error) {
    console.error("Failed to get top books by favorites", error);
    return err({ reason: "Failed to get top books by favorites", cause: error });
  }
};
const getTopCreatorsByFollows = async (range, currentPage = 1, defaultLimit = 10) => {
  try {
    const dateFilter = buildCreatedAtFilter(follows.createdAt, range);
    const creatorFollowsFilter = isNotNull(follows.targetCreatorId);
    const followWhere = dateFilter ? and(creatorFollowsFilter, dateFilter) : creatorFollowsFilter;
    const countQuery = db.select({
      value: sql`count(distinct ${follows.targetCreatorId})`
    }).from(follows).where(followWhere);
    const [{ value: totalCount = 0 }] = await countQuery;
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit
    );
    if (totalCount === 0) {
      return ok({ creators: [], totalPages: 1, page: 1 });
    }
    const followQuery = db.select({
      creatorId: follows.targetCreatorId,
      followCount: count()
    }).from(follows).where(followWhere).groupBy(follows.targetCreatorId).orderBy(desc(count())).limit(limit).offset(offset);
    const followRows = await followQuery;
    if (followRows.length === 0) {
      return ok({ creators: [], totalPages, page });
    }
    const creatorIds = followRows.map((row) => row.creatorId).filter((id) => id !== null);
    const followCountByCreatorId = new Map(
      followRows.filter(
        (row) => row.creatorId !== null
      ).map((row) => [row.creatorId, row.followCount])
    );
    const creatorRows = await db.query.creators.findMany({
      where: inArray(creators.id, creatorIds),
      columns: {
        id: true,
        displayName: true,
        slug: true,
        coverUrl: true,
        type: true
      }
    });
    const creatorById = new Map(creatorRows.map((creator) => [creator.id, creator]));
    const topCreators = creatorIds.map((creatorId) => {
      const creator = creatorById.get(creatorId);
      if (!creator) return null;
      return {
        creatorId: creator.id,
        displayName: creator.displayName,
        slug: creator.slug,
        coverUrl: creator.coverUrl,
        type: creator.type,
        followCount: followCountByCreatorId.get(creator.id) ?? 0
      };
    }).filter((row) => row !== null);
    return ok({ creators: topCreators, totalPages, page });
  } catch (error) {
    console.error("Failed to get top creators by follows", error);
    return err({
      reason: "Failed to get top creators by follows",
      cause: error
    });
  }
};
export {
  getTopBooksByFavorites,
  getTopCreatorsByFollows
};
