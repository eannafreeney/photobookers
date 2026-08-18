import { and, count, eq, inArray, isNull, lte, ne, or } from "drizzle-orm";
import {
  BOOK_CARD_COLUMNS,
  CREATOR_CARD_COLUMNS
} from "../../constants/queries.js";
import { db } from "../../db/client.js";
import { books, users, wishlists } from "../../db/schema.js";
import { getBooksOrderBy } from "../../lib/booksOrderBy.js";
import { getPagination } from "../../lib/pagination.js";
import { err, ok } from "../../lib/result.js";
import {
  baseShelfSlugFromUser,
  formatShelfOwnerName,
  isReservedShelfSlug,
  shelfSlugSchema,
  withShelfSlugSuffix
} from "./utils.js";
const publishedBookConditions = and(
  eq(books.publicationStatus, "published"),
  eq(books.approvalStatus, "approved"),
  or(isNull(books.releaseDate), lte(books.releaseDate, /* @__PURE__ */ new Date()))
);
async function suggestShelfSlug(userId) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId)
  });
  if (!user) return null;
  const base = baseShelfSlugFromUser({
    firstName: user.firstName,
    lastName: user.lastName
  }) ?? `member-${user.id.slice(0, 8)}`;
  for (let i = 1; i <= 50; i++) {
    const candidate = withShelfSlugSuffix(base, i);
    if (isReservedShelfSlug(candidate)) continue;
    const existing = await db.query.users.findFirst({
      where: eq(users.shelfSlug, candidate),
      columns: { id: true }
    });
    if (!existing || existing.id === userId) return candidate;
  }
  return `${base}-${user.id.slice(0, 6)}`;
}
async function getPublicShelfBySlug(slug) {
  const user = await db.query.users.findFirst({
    where: and(eq(users.shelfSlug, slug), eq(users.shelfPublic, true)),
    with: {
      creators: { columns: { id: true, slug: true, displayName: true } }
    }
  });
  if (!user) return err({ reason: "Shelf not found" });
  const creator = user.creators[0] ?? null;
  return ok({
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      shelfSlug: user.shelfSlug,
      displayName: formatShelfOwnerName({
        firstName: user.firstName,
        lastName: user.lastName
      }),
      creator: creator ? {
        id: creator.id,
        slug: creator.slug,
        displayName: creator.displayName
      } : null
    }
  });
}
async function getPublicBooksInWishlist(userId, currentPage, sortBy = "newest", defaultLimit = 12) {
  try {
    const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(wishlists).innerJoin(books, eq(wishlists.bookId, books.id)).where(and(eq(wishlists.userId, userId), publishedBookConditions));
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit
    );
    const wishlistRows = await db.select({ bookId: wishlists.bookId }).from(wishlists).innerJoin(books, eq(wishlists.bookId, books.id)).where(and(eq(wishlists.userId, userId), publishedBookConditions));
    const bookIds = wishlistRows.map((row) => row.bookId);
    if (bookIds.length === 0) {
      return ok({ books: [], totalPages, page, totalCount });
    }
    const wishlistedBooks = await db.query.books.findMany({
      columns: BOOK_CARD_COLUMNS,
      where: and(inArray(books.id, bookIds), publishedBookConditions),
      with: {
        artist: { columns: CREATOR_CARD_COLUMNS },
        publisher: { columns: CREATOR_CARD_COLUMNS }
      },
      orderBy: getBooksOrderBy(sortBy),
      limit,
      offset
    });
    return ok({
      books: wishlistedBooks,
      totalPages,
      page,
      totalCount
    });
  } catch (error) {
    console.error("Failed to get public books in wishlist", error);
    return err({ reason: "Failed to get public shelf books", error });
  }
}
async function updateShelfSharing(userId, input) {
  const owner = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true }
  });
  if (!owner) return err({ reason: "User not found" });
  if (!input.shelfPublic) {
    try {
      const [updated] = await db.update(users).set({ shelfPublic: false }).where(eq(users.id, userId)).returning();
      if (!updated) return err({ reason: "User not found" });
      return ok(updated);
    } catch (error) {
      console.error("Failed to disable shelf sharing", error);
      return err({ reason: "Failed to update shelf sharing", error });
    }
  }
  const parsedSlug = shelfSlugSchema.safeParse(input.shelfSlug ?? "");
  if (!parsedSlug.success) {
    return err({
      reason: parsedSlug.error.issues[0]?.message ?? "Invalid shelf slug"
    });
  }
  const slug = parsedSlug.data;
  if (isReservedShelfSlug(slug)) {
    return err({ reason: "This shelf URL is not available" });
  }
  const taken = await db.query.users.findFirst({
    where: and(eq(users.shelfSlug, slug), ne(users.id, userId)),
    columns: { id: true }
  });
  if (taken) return err({ reason: "This shelf URL is already taken" });
  try {
    const [updated] = await db.update(users).set({ shelfPublic: true, shelfSlug: slug }).where(eq(users.id, userId)).returning();
    if (!updated) return err({ reason: "User not found" });
    return ok(updated);
  } catch (error) {
    console.error("Failed to enable shelf sharing", error);
    return err({ reason: "Failed to update shelf sharing", error });
  }
}
export {
  getPublicBooksInWishlist,
  getPublicShelfBySlug,
  suggestShelfSlug,
  updateShelfSharing
};
