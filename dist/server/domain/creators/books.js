import { and, asc, count, desc, eq, ilike, isNull, lte, or } from "drizzle-orm";
import {
  BOOK_CARD_COLUMNS,
  CREATOR_CARD_COLUMNS
} from "../../constants/queries.js";
import { db } from "../../db/client.js";
import { books, creators } from "../../db/schema.js";
import { getBooksOrderBy } from "../../lib/booksOrderBy.js";
import { getPagination } from "../../lib/pagination.js";
import { err, ok } from "../../lib/result.js";
const getBooksByCreatorId = async (creatorId, currentPage, searchQuery, defaultLimit = 3) => {
  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.id, creatorId)
    });
    if (!creator) return err({ reason: "Creator not found" });
    const bookColumn = creatorRoleBookColumn(creator);
    const baseFilter = eq(bookColumn, creatorId);
    const titleFilter = searchQuery?.trim() ? ilike(books.title, `%${searchQuery.trim()}%`) : void 0;
    const whereClause = titleFilter ? and(baseFilter, titleFilter) : baseFilter;
    const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(books).where(whereClause);
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit
    );
    const foundBooks = await db.query.books.findMany({
      where: whereClause,
      orderBy: [asc(books.sortOrder), desc(books.createdAt)],
      with: {
        artist: true,
        publisher: true
      },
      limit,
      offset
    });
    if (foundBooks.length === 0)
      return ok({ books: [], totalPages, page, creator });
    return ok({ books: foundBooks, totalPages, page, creator });
  } catch (error) {
    console.error("Failed to get books by creator id", error);
    return err({ reason: "Failed to get books by creator id", cause: error });
  }
};
function creatorRoleBookColumn(creator) {
  return creator.type === "publisher" ? books.publisherId : books.artistId;
}
function publicCreatorBooksListWhere(creator, searchQuery) {
  const bookColumn = creatorRoleBookColumn(creator);
  const titleFilter = searchQuery?.trim() ? ilike(books.title, `%${searchQuery.trim()}%`) : void 0;
  const visibility = and(
    eq(bookColumn, creator.id),
    eq(books.publicationStatus, "published"),
    or(isNull(books.releaseDate), lte(books.releaseDate, /* @__PURE__ */ new Date()))
  );
  return titleFilter ? and(visibility, titleFilter) : visibility;
}
function publicCreatorBooksCountWhere(creator) {
  const bookColumn = creatorRoleBookColumn(creator);
  return and(
    eq(bookColumn, creator.id),
    eq(books.publicationStatus, "published"),
    eq(books.approvalStatus, "approved")
  );
}
const getPublicBooksByCreatorId = async (creatorId, currentPage, options) => {
  const sortBy = options?.sortBy ?? "creator_order";
  const defaultLimit = options?.defaultLimit ?? 16;
  const searchQuery = options?.searchQuery;
  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.id, creatorId)
    });
    if (!creator) return err({ reason: "Creator not found" });
    return getPublicBooksForCreator(creator, currentPage, {
      sortBy,
      defaultLimit,
      searchQuery
    });
  } catch (error) {
    console.error("Failed to get public books by creator id", error);
    return err({
      reason: "Failed to get public books by creator id",
      cause: error
    });
  }
};
const getPublicBooksForCreator = async (creator, currentPage, options) => {
  const sortBy = options?.sortBy ?? "creator_order";
  const defaultLimit = options?.defaultLimit ?? 16;
  const searchQuery = options?.searchQuery;
  const listWhere = publicCreatorBooksListWhere(creator, searchQuery);
  try {
    const [countResult, foundBooks] = await Promise.all([
      db.select({ value: count() }).from(books).where(publicCreatorBooksCountWhere(creator)),
      db.query.books.findMany({
        columns: BOOK_CARD_COLUMNS,
        where: listWhere,
        orderBy: getBooksOrderBy(sortBy),
        limit: defaultLimit,
        offset: (currentPage - 1) * defaultLimit,
        with: {
          artist: { columns: CREATOR_CARD_COLUMNS },
          publisher: { columns: CREATOR_CARD_COLUMNS }
        }
      })
    ]);
    const totalCount = countResult[0]?.value ?? 0;
    const { totalPages, page } = getPagination(
      currentPage,
      totalCount,
      defaultLimit
    );
    return ok({ books: foundBooks, totalPages, page, creator });
  } catch (error) {
    console.error("Failed to get public books for creator", error);
    return err({ reason: "Failed to get public books for creator", cause: error });
  }
};
export {
  getBooksByCreatorId,
  getPublicBooksByCreatorId,
  getPublicBooksForCreator
};
