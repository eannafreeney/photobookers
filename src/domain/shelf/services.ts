import { and, count, eq, inArray, isNull, lte, ne, or } from "drizzle-orm";
import {
  BOOK_CARD_COLUMNS,
  CREATOR_CARD_COLUMNS,
} from "../../constants/queries";
import { db } from "../../db/client";
import { books, users, wishlists } from "../../db/schema";
import { getBooksOrderBy } from "../../lib/booksOrderBy";
import { getPagination } from "../../lib/pagination";
import { err, ok } from "../../lib/result";
import {
  baseShelfSlugFromUser,
  formatShelfOwnerName,
  isReservedShelfSlug,
  shelfSlugSchema,
  withShelfSlugSuffix,
} from "./utils";

const publishedBookConditions = and(
  eq(books.publicationStatus, "published"),
  eq(books.approvalStatus, "approved"),
  or(isNull(books.releaseDate), lte(books.releaseDate, new Date())),
);

export async function suggestShelfSlug(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: { creators: { columns: { displayName: true } } },
  });
  if (!user) return null;

  const base =
    baseShelfSlugFromUser({
      firstName: user.firstName,
      lastName: user.lastName,
      creator: user.creators[0] ?? null,
    }) ?? `member-${user.id.slice(0, 8)}`;

  for (let i = 1; i <= 50; i++) {
    const candidate = withShelfSlugSuffix(base, i);
    if (isReservedShelfSlug(candidate)) continue;

    const existing = await db.query.users.findFirst({
      where: eq(users.shelfSlug, candidate),
      columns: { id: true },
    });
    if (!existing || existing.id === userId) return candidate;
  }

  return `${base}-${user.id.slice(0, 6)}`;
}

export async function getPublicShelfBySlug(slug: string) {
  const user = await db.query.users.findFirst({
    where: and(eq(users.shelfSlug, slug), eq(users.shelfPublic, true)),
    with: { creators: { columns: { displayName: true } } },
  });

  if (!user) return err({ reason: "Shelf not found" });

  return ok({
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      shelfSlug: user.shelfSlug,
      creator: user.creators[0] ?? null,
      displayName: formatShelfOwnerName({
        firstName: user.firstName,
        lastName: user.lastName,
        creator: user.creators[0] ?? null,
      }),
    },
  });
}

export async function getPublicBooksInWishlist(
  userId: string,
  currentPage: number,
  sortBy: "newest" | "oldest" | "title_asc" | "title_desc" = "newest",
  defaultLimit = 12,
) {
  try {
    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(wishlists)
      .innerJoin(books, eq(wishlists.bookId, books.id))
      .where(and(eq(wishlists.userId, userId), publishedBookConditions));

    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit,
    );

    const wishlistRows = await db
      .select({ bookId: wishlists.bookId })
      .from(wishlists)
      .innerJoin(books, eq(wishlists.bookId, books.id))
      .where(and(eq(wishlists.userId, userId), publishedBookConditions));

    const bookIds = wishlistRows.map((row) => row.bookId);
    if (bookIds.length === 0) {
      return ok({ books: [], totalPages, page, totalCount });
    }

    const wishlistedBooks = await db.query.books.findMany({
      columns: BOOK_CARD_COLUMNS,
      where: and(inArray(books.id, bookIds), publishedBookConditions),
      with: {
        artist: { columns: CREATOR_CARD_COLUMNS },
        publisher: { columns: CREATOR_CARD_COLUMNS },
      },
      orderBy: getBooksOrderBy(sortBy),
      limit,
      offset,
    });

    return ok({
      books: wishlistedBooks,
      totalPages,
      page,
      totalCount,
    });
  } catch (error) {
    console.error("Failed to get public books in wishlist", error);
    return err({ reason: "Failed to get public shelf books", error });
  }
}

type UpdateShelfSharingInput = {
  shelfPublic: boolean;
  shelfSlug?: string;
};

export async function updateShelfSharing(
  userId: string,
  input: UpdateShelfSharingInput,
) {
  if (!input.shelfPublic) {
    try {
      const [updated] = await db
        .update(users)
        .set({ shelfPublic: false })
        .where(eq(users.id, userId))
        .returning();
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
      reason: parsedSlug.error.issues[0]?.message ?? "Invalid shelf slug",
    });
  }

  const slug = parsedSlug.data;
  if (isReservedShelfSlug(slug)) {
    return err({ reason: "This shelf URL is not available" });
  }

  const taken = await db.query.users.findFirst({
    where: and(eq(users.shelfSlug, slug), ne(users.id, userId)),
    columns: { id: true },
  });
  if (taken) return err({ reason: "This shelf URL is already taken" });

  try {
    const [updated] = await db
      .update(users)
      .set({ shelfPublic: true, shelfSlug: slug })
      .where(eq(users.id, userId))
      .returning();
    if (!updated) return err({ reason: "User not found" });
    return ok(updated);
  } catch (error) {
    console.error("Failed to enable shelf sharing", error);
    return err({ reason: "Failed to update shelf sharing", error });
  }
}
