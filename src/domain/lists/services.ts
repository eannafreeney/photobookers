import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  lte,
  ne,
  notInArray,
  or,
  sql,
} from "drizzle-orm";
import {
  BOOK_CARD_COLUMNS,
  CREATOR_CARD_COLUMNS,
  type BookCardResult,
} from "../../constants/queries";
import { db } from "../../db/client";
import {
  bookComments,
  bookListItems,
  bookLists,
  books,
  creators,
  users,
  wishlists,
  type BookList,
} from "../../db/schema";
import { getBooksOrderBy } from "../../lib/booksOrderBy";
import { getPagination } from "../../lib/pagination";
import { err, ok } from "../../lib/result";
import { formatShelfOwnerName } from "../shelf/utils";
import {
  FAVORITES_LIST_ID,
  FAVORITES_LIST_SLUG,
  FAVORITES_LIST_TITLE,
  isFavoritesListSlug,
  isListPromotionEligible,
  isReservedListSlug,
  listDescriptionSchema,
  listItemNoteSchema,
  listSlugSchema,
  listTitleSchema,
  slugFromTitle,
  withListSlugSuffix,
} from "./utils";

const publishedBookConditions = and(
  eq(books.publicationStatus, "published"),
  eq(books.approvalStatus, "approved"),
  or(isNull(books.releaseDate), lte(books.releaseDate, new Date())),
);

async function nextListItemPosition(listId: string) {
  const [row] = await db
    .select({
      value: sql<number>`coalesce(max(${bookListItems.position}), -1)`,
    })
    .from(bookListItems)
    .where(eq(bookListItems.listId, listId));
  return Number(row?.value ?? -1) + 1;
}

export async function suggestListSlug(userId: string, title: string) {
  const base = slugFromTitle(title) || `list-${userId.slice(0, 8)}`;
  for (let i = 1; i <= 50; i++) {
    const candidate = withListSlugSuffix(base, i);
    if (isReservedListSlug(candidate)) continue;
    const existing = await db.query.bookLists.findFirst({
      where: and(eq(bookLists.userId, userId), eq(bookLists.slug, candidate)),
      columns: { id: true },
    });
    if (!existing) return candidate;
  }
  return `${base}-${userId.slice(0, 6)}`;
}

export async function listBookListsForUser(userId: string) {
  return db.query.bookLists.findMany({
    where: eq(bookLists.userId, userId),
    orderBy: [desc(bookLists.updatedAt), desc(bookLists.createdAt)],
  });
}

async function favoritesBookCount(userId: string) {
  const [{ value = 0 } = { value: 0 }] = await db
    .select({ value: count() })
    .from(wishlists)
    .innerJoin(books, eq(wishlists.bookId, books.id))
    .where(and(eq(wishlists.userId, userId), publishedBookConditions));
  return value;
}

async function favoritesCoverUrls(userId: string, limit = 3) {
  const rows = await db
    .select({ coverUrl: books.coverUrl })
    .from(wishlists)
    .innerJoin(books, eq(wishlists.bookId, books.id))
    .where(
      and(
        eq(wishlists.userId, userId),
        publishedBookConditions,
        isNotNull(books.coverUrl),
      ),
    )
    .orderBy(desc(wishlists.createdAt))
    .limit(limit * 2);

  const urls: string[] = [];
  for (const row of rows) {
    if (!row.coverUrl) continue;
    urls.push(row.coverUrl);
    if (urls.length >= limit) break;
  }
  return urls;
}

/** Virtual Favorites list row — wishlist-backed, always first in list-of-lists. */
export function favoritesListRow(
  userId: string,
  bookCount: number,
  extras?: { coverUrls?: string[] },
): BookList & { bookCount: number; coverUrls?: string[] } {
  return {
    id: FAVORITES_LIST_ID,
    userId,
    title: FAVORITES_LIST_TITLE,
    slug: FAVORITES_LIST_SLUG,
    description: null,
    isPublic: true,
    isPromoted: false,
    promotedAt: null,
    createdAt: new Date(0),
    updatedAt: null,
    bookCount,
    ...(extras?.coverUrls ? { coverUrls: extras.coverUrls } : {}),
  };
}

export async function listBookListsWithCounts(userId: string) {
  const favoritesCount = await favoritesBookCount(userId);
  const favorites = favoritesListRow(userId, favoritesCount);
  const lists = await listBookListsForUser(userId);
  if (lists.length === 0) return [favorites];

  const counts = await db
    .select({
      listId: bookListItems.listId,
      value: count(),
    })
    .from(bookListItems)
    .where(
      inArray(
        bookListItems.listId,
        lists.map((l) => l.id),
      ),
    )
    .groupBy(bookListItems.listId);

  const countMap = new Map(counts.map((c) => [c.listId, c.value]));
  return [
    favorites,
    ...lists.map((list) => ({
      ...list,
      bookCount: countMap.get(list.id) ?? 0,
    })),
  ];
}

export async function getBookListForOwner(listId: string, userId: string) {
  const list = await db.query.bookLists.findFirst({
    where: and(eq(bookLists.id, listId), eq(bookLists.userId, userId)),
  });
  if (!list) return err({ reason: "List not found" });
  return ok(list);
}

export async function getPublicListsForUser(userId: string) {
  const [favoritesCount, favoritesCovers] = await Promise.all([
    favoritesBookCount(userId),
    favoritesCoverUrls(userId),
  ]);
  const favorites = favoritesListRow(userId, favoritesCount, {
    coverUrls: favoritesCovers,
  });

  const lists = await db.query.bookLists.findMany({
    where: and(eq(bookLists.userId, userId), eq(bookLists.isPublic, true)),
    orderBy: [desc(bookLists.updatedAt), desc(bookLists.createdAt)],
  });
  if (lists.length === 0) return [favorites];

  const counts = await db
    .select({
      listId: bookListItems.listId,
      value: count(),
    })
    .from(bookListItems)
    .innerJoin(books, eq(bookListItems.bookId, books.id))
    .where(
      and(
        inArray(
          bookListItems.listId,
          lists.map((l) => l.id),
        ),
        publishedBookConditions,
      ),
    )
    .groupBy(bookListItems.listId);

  const coverRows = await db
    .select({
      listId: bookListItems.listId,
      coverUrl: books.coverUrl,
      createdAt: bookListItems.createdAt,
    })
    .from(bookListItems)
    .innerJoin(books, eq(bookListItems.bookId, books.id))
    .where(
      and(
        inArray(
          bookListItems.listId,
          lists.map((l) => l.id),
        ),
        publishedBookConditions,
      ),
    )
    .orderBy(desc(bookListItems.createdAt));

  const coversByList = new Map<string, string[]>();
  for (const row of coverRows) {
    if (!row.coverUrl) continue;
    const existing = coversByList.get(row.listId) ?? [];
    if (existing.length >= 3) continue;
    existing.push(row.coverUrl);
    coversByList.set(row.listId, existing);
  }

  const countMap = new Map(counts.map((c) => [c.listId, c.value]));
  return [
    favorites,
    ...lists.map((list) => ({
      ...list,
      bookCount: countMap.get(list.id) ?? 0,
      coverUrls: coversByList.get(list.id) ?? [],
    })),
  ];
}

export async function getPublicListByShelfAndSlug(
  shelfSlug: string,
  listSlug: string,
) {
  const owner = await db.query.users.findFirst({
    where: and(eq(users.shelfSlug, shelfSlug), eq(users.shelfPublic, true)),
  });
  if (!owner) return err({ reason: "Shelf not found" });

  if (isFavoritesListSlug(listSlug)) {
    const bookCount = await favoritesBookCount(owner.id);
    return ok({
      owner,
      list: favoritesListRow(owner.id, bookCount),
      isFavorites: true as const,
    });
  }

  const list = await db.query.bookLists.findFirst({
    where: and(
      eq(bookLists.userId, owner.id),
      eq(bookLists.slug, listSlug),
      eq(bookLists.isPublic, true),
    ),
  });
  if (!list) return err({ reason: "List not found" });

  return ok({ owner, list, isFavorites: false as const });
}

type CreateListInput = {
  title: string;
  description?: string | null;
  isPublic?: boolean;
  slug?: string;
};

export async function createBookList(userId: string, input: CreateListInput) {
  const titleParsed = listTitleSchema.safeParse(input.title);
  if (!titleParsed.success) {
    return err({
      reason: titleParsed.error.issues[0]?.message ?? "Invalid title",
    });
  }

  const descriptionParsed = listDescriptionSchema.safeParse(
    input.description ?? undefined,
  );
  if (!descriptionParsed.success) {
    return err({
      reason:
        descriptionParsed.error.issues[0]?.message ?? "Invalid description",
    });
  }

  let slug: string;
  if (input.slug != null) {
    const slugParsed = listSlugSchema.safeParse(input.slug);
    if (!slugParsed.success) {
      return err({
        reason: slugParsed.error.issues[0]?.message ?? "Invalid slug",
      });
    }
    slug = slugParsed.data;
  } else {
    slug = await suggestListSlug(userId, titleParsed.data);
  }

  if (isReservedListSlug(slug)) {
    return err({ reason: "This list URL is not available" });
  }

  const taken = await db.query.bookLists.findFirst({
    where: and(eq(bookLists.userId, userId), eq(bookLists.slug, slug)),
    columns: { id: true },
  });
  if (taken) return err({ reason: "You already have a list with this URL" });

  try {
    const [created] = await db
      .insert(bookLists)
      .values({
        userId,
        title: titleParsed.data,
        slug,
        description: descriptionParsed.data,
        isPublic: input.isPublic ?? false,
      })
      .returning();
    return ok(created);
  } catch (error) {
    console.error("Failed to create book list", error);
    return err({ reason: "Failed to create list", error });
  }
}

type UpdateListInput = {
  title?: string;
  description?: string | null;
  isPublic?: boolean;
  slug?: string;
};

export async function updateBookList(
  listId: string,
  userId: string,
  input: UpdateListInput,
) {
  const [ownerErr, existing] = await getBookListForOwner(listId, userId);
  if (ownerErr || !existing) return err(ownerErr ?? { reason: "List not found" });

  const updates: Partial<BookList> = {};

  if (input.title !== undefined) {
    const titleParsed = listTitleSchema.safeParse(input.title);
    if (!titleParsed.success) {
      return err({
        reason: titleParsed.error.issues[0]?.message ?? "Invalid title",
      });
    }
    updates.title = titleParsed.data;
  }

  if (input.description !== undefined) {
    const descriptionParsed = listDescriptionSchema.safeParse(
      input.description ?? undefined,
    );
    if (!descriptionParsed.success) {
      return err({
        reason:
          descriptionParsed.error.issues[0]?.message ?? "Invalid description",
      });
    }
    updates.description = descriptionParsed.data;
  }

  if (input.isPublic !== undefined) {
    updates.isPublic = input.isPublic;
    if (!input.isPublic) {
      updates.isPromoted = false;
      updates.promotedAt = null;
    }
  }

  if (input.slug !== undefined) {
    const slugParsed = listSlugSchema.safeParse(input.slug);
    if (!slugParsed.success) {
      return err({
        reason: slugParsed.error.issues[0]?.message ?? "Invalid slug",
      });
    }
    if (isReservedListSlug(slugParsed.data)) {
      return err({ reason: "This list URL is not available" });
    }
    const taken = await db.query.bookLists.findFirst({
      where: and(
        eq(bookLists.userId, userId),
        eq(bookLists.slug, slugParsed.data),
        ne(bookLists.id, listId),
      ),
      columns: { id: true },
    });
    if (taken) return err({ reason: "You already have a list with this URL" });
    updates.slug = slugParsed.data;
  }

  try {
    const [updated] = await db
      .update(bookLists)
      .set(updates)
      .where(and(eq(bookLists.id, listId), eq(bookLists.userId, userId)))
      .returning();
    if (!updated) return err({ reason: "List not found" });
    return ok(updated);
  } catch (error) {
    console.error("Failed to update book list", error);
    return err({ reason: "Failed to update list", error });
  }
}

export async function deleteBookList(listId: string, userId: string) {
  try {
    const deleted = await db
      .delete(bookLists)
      .where(and(eq(bookLists.id, listId), eq(bookLists.userId, userId)))
      .returning({ id: bookLists.id });
    if (deleted.length === 0) return err({ reason: "List not found" });
    return ok(undefined);
  } catch (error) {
    console.error("Failed to delete book list", error);
    return err({ reason: "Failed to delete list", error });
  }
}

export async function findListMembership(
  listId: string,
  bookId: string,
  userId: string,
) {
  const list = await db.query.bookLists.findFirst({
    where: and(eq(bookLists.id, listId), eq(bookLists.userId, userId)),
    columns: { id: true },
  });
  if (!list) return err({ reason: "List not found" });

  const item = await db.query.bookListItems.findFirst({
    where: and(
      eq(bookListItems.listId, listId),
      eq(bookListItems.bookId, bookId),
    ),
  });
  if (!item) return err({ reason: "Not in list" });
  return ok(item);
}

export async function getListMembershipsForBook(
  userId: string,
  bookId: string,
) {
  const lists = await listBookListsForUser(userId);
  if (lists.length === 0) return [];

  const memberships = await db
    .select({ listId: bookListItems.listId })
    .from(bookListItems)
    .where(
      and(
        eq(bookListItems.bookId, bookId),
        inArray(
          bookListItems.listId,
          lists.map((l) => l.id),
        ),
      ),
    );

  const inList = new Set(memberships.map((m) => m.listId));
  return lists.map((list) => ({
    ...list,
    containsBook: inList.has(list.id),
  }));
}

export async function toggleListMembership(
  listId: string,
  bookId: string,
  userId: string,
) {
  const list = await db.query.bookLists.findFirst({
    where: and(eq(bookLists.id, listId), eq(bookLists.userId, userId)),
  });
  if (!list) return err({ reason: "List not found" });

  const existing = await db.query.bookListItems.findFirst({
    where: and(
      eq(bookListItems.listId, listId),
      eq(bookListItems.bookId, bookId),
    ),
  });

  try {
    if (existing) {
      await db
        .delete(bookListItems)
        .where(
          and(
            eq(bookListItems.listId, listId),
            eq(bookListItems.bookId, bookId),
          ),
        );
      return ok({ added: false as const, list });
    }

    await db.insert(bookListItems).values({
      listId,
      bookId,
      position: await nextListItemPosition(listId),
    });
    return ok({ added: true as const, list });
  } catch (error) {
    console.error("Failed to toggle list membership", error);
    return err({ reason: "Failed to update list", error });
  }
}

export async function addBookToList(
  listId: string,
  bookId: string,
  userId: string,
) {
  const list = await db.query.bookLists.findFirst({
    where: and(eq(bookLists.id, listId), eq(bookLists.userId, userId)),
    columns: { id: true },
  });
  if (!list) return err({ reason: "List not found" });

  const existing = await db.query.bookListItems.findFirst({
    where: and(
      eq(bookListItems.listId, listId),
      eq(bookListItems.bookId, bookId),
    ),
    columns: { bookId: true },
  });
  if (existing) return ok(undefined);

  try {
    await db.insert(bookListItems).values({
      listId,
      bookId,
      position: await nextListItemPosition(listId),
    });
    return ok(undefined);
  } catch (error) {
    console.error("Failed to add book to list", error);
    return err({ reason: "Failed to add book", error });
  }
}

/** Published books matching title/artist/publisher, excluding ones already in the list. */
export async function searchBooksForList(
  listId: string,
  query: string,
  limit = 12,
) {
  const q = query.trim();
  if (q.length < 2) return ok([] as BookCardResult[]);

  try {
    const existing = await db.query.bookListItems.findMany({
      where: eq(bookListItems.listId, listId),
      columns: { bookId: true },
    });
    const existingIds = existing.map((row) => row.bookId);

    const creatorRows = await db
      .select({ id: creators.id })
      .from(creators)
      .where(ilike(creators.displayName, `%${q}%`));
    const creatorIds = creatorRows.map((row) => row.id);

    const match =
      creatorIds.length > 0
        ? or(
            ilike(books.title, `%${q}%`),
            inArray(books.artistId, creatorIds),
            inArray(books.publisherId, creatorIds),
          )
        : ilike(books.title, `%${q}%`);

    const rows = await db.query.books.findMany({
      where: and(
        publishedBookConditions,
        match,
        existingIds.length > 0 ? notInArray(books.id, existingIds) : undefined,
      ),
      orderBy: (table, { asc }) => [asc(table.title)],
      limit,
      columns: BOOK_CARD_COLUMNS,
      with: { artist: { columns: CREATOR_CARD_COLUMNS } },
    });

    return ok(rows as BookCardResult[]);
  } catch (error) {
    console.error("Failed to search books for list", error);
    return err({ reason: "Failed to search books", error });
  }
}

export async function removeBookFromList(
  listId: string,
  bookId: string,
  userId: string,
) {
  const list = await db.query.bookLists.findFirst({
    where: and(eq(bookLists.id, listId), eq(bookLists.userId, userId)),
    columns: { id: true },
  });
  if (!list) return err({ reason: "List not found" });

  try {
    await db
      .delete(bookListItems)
      .where(
        and(eq(bookListItems.listId, listId), eq(bookListItems.bookId, bookId)),
      );
    return ok(undefined);
  } catch (error) {
    console.error("Failed to remove book from list", error);
    return err({ reason: "Failed to remove book", error });
  }
}

export async function getListItemForOwner(
  listId: string,
  bookId: string,
  userId: string,
) {
  const [ownerErr, list] = await getBookListForOwner(listId, userId);
  if (ownerErr || !list) return err(ownerErr ?? { reason: "List not found" });

  const item = await db.query.bookListItems.findFirst({
    where: and(
      eq(bookListItems.listId, listId),
      eq(bookListItems.bookId, bookId),
    ),
  });
  if (!item) return err({ reason: "Book is not in this list" });

  const book = await db.query.books.findFirst({
    where: eq(books.id, bookId),
    columns: BOOK_CARD_COLUMNS,
    with: {
      artist: { columns: CREATOR_CARD_COLUMNS },
      publisher: { columns: CREATOR_CARD_COLUMNS },
    },
  });
  if (!book) return err({ reason: "Book not found" });

  return ok({ list, item, book });
}

/** Comments the list owner left on this book — for “use as note” in the note modal. */
export async function getUserCommentsForBook(
  userId: string,
  bookId: string,
  limit = 5,
) {
  return db.query.bookComments.findMany({
    where: and(eq(bookComments.bookId, bookId), eq(bookComments.userId, userId)),
    orderBy: [desc(bookComments.createdAt)],
    columns: { id: true, body: true, createdAt: true },
    limit,
  });
}

export async function updateListItemNote(
  listId: string,
  bookId: string,
  userId: string,
  note: string,
) {
  const [ownerErr] = await getBookListForOwner(listId, userId);
  if (ownerErr) return err(ownerErr);

  const parsed = listItemNoteSchema.safeParse(note);
  if (!parsed.success) {
    return err({
      reason: parsed.error.issues[0]?.message ?? "Invalid note",
    });
  }
  const trimmed = parsed.data;

  const existing = await db.query.bookListItems.findFirst({
    where: and(
      eq(bookListItems.listId, listId),
      eq(bookListItems.bookId, bookId),
    ),
    columns: { bookId: true },
  });
  if (!existing) return err({ reason: "Book is not in this list" });

  try {
    await db
      .update(bookListItems)
      .set({ note: trimmed })
      .where(
        and(eq(bookListItems.listId, listId), eq(bookListItems.bookId, bookId)),
      );
    return ok(undefined);
  } catch (error) {
    console.error("Failed to update list item note", error);
    return err({ reason: "Failed to save note", error });
  }
}

export async function reorderBooksInList(
  listId: string,
  userId: string,
  orderedIds: string[],
) {
  if (!orderedIds.length) return err({ reason: "No books to reorder" });
  if (new Set(orderedIds).size !== orderedIds.length) {
    return err({ reason: "Duplicate book IDs" });
  }

  const [ownerErr] = await getBookListForOwner(listId, userId);
  if (ownerErr) return err(ownerErr);

  const owned = await db.query.bookListItems.findMany({
    where: and(
      eq(bookListItems.listId, listId),
      inArray(bookListItems.bookId, orderedIds),
    ),
    columns: { bookId: true },
  });
  if (owned.length !== orderedIds.length) {
    return err({ reason: "One or more books are not in this list" });
  }

  try {
    await db.transaction(async (tx) => {
      for (const [index, bookId] of orderedIds.entries()) {
        await tx
          .update(bookListItems)
          .set({ position: index })
          .where(
            and(
              eq(bookListItems.listId, listId),
              eq(bookListItems.bookId, bookId),
            ),
          );
      }
    });
    return ok(undefined);
  } catch (error) {
    console.error("Failed to reorder books in list", error);
    return err({ reason: "Failed to reorder books", error });
  }
}

export async function getBooksInList(
  listId: string,
  currentPage: number,
  sortBy: "newest" | "oldest" | "title_asc" | "title_desc" = "newest",
  defaultLimit = 12,
) {
  try {
    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(bookListItems)
      .innerJoin(books, eq(bookListItems.bookId, books.id))
      .where(and(eq(bookListItems.listId, listId), publishedBookConditions));

    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit,
    );

    const itemRows = await db
      .select({ bookId: bookListItems.bookId, note: bookListItems.note })
      .from(bookListItems)
      .innerJoin(books, eq(bookListItems.bookId, books.id))
      .where(and(eq(bookListItems.listId, listId), publishedBookConditions))
      .orderBy(asc(bookListItems.position), desc(bookListItems.createdAt))
      .limit(limit)
      .offset(offset);

    const bookIds = itemRows.map((row) => row.bookId);
    if (bookIds.length === 0) {
      return ok({ books: [], totalPages, page, totalCount });
    }

    const noteById = new Map(itemRows.map((row) => [row.bookId, row.note]));

    const listBooks = await db.query.books.findMany({
      columns: BOOK_CARD_COLUMNS,
      where: and(inArray(books.id, bookIds), publishedBookConditions),
      with: {
        artist: { columns: CREATOR_CARD_COLUMNS },
        publisher: { columns: CREATOR_CARD_COLUMNS },
        images: {
          columns: { imageUrl: true },
          orderBy: (table, { asc }) => [asc(table.sortOrder)],
        },
      },
      orderBy: getBooksOrderBy(sortBy),
      limit,
      offset: 0,
    });

    // Preserve list order when sort is default newest (by added date via itemRows).
    const byId = new Map(listBooks.map((b) => [b.id, b]));
    const ordered =
      sortBy === "newest"
        ? bookIds.map((id) => byId.get(id)).filter(Boolean)
        : listBooks;

    const booksWithNotes = (ordered as typeof listBooks).map((book) => ({
      ...book,
      note: noteById.get(book.id) ?? null,
    }));

    return ok({
      books: booksWithNotes,
      totalPages,
      page,
      totalCount,
    });
  } catch (error) {
    console.error("Failed to get books in list", error);
    return err({ reason: "Failed to load list books", error });
  }
}

export async function listPublicListsForAdmin(
  currentPage: number,
  searchQuery?: string | null,
  defaultLimit = 20,
) {
  try {
    const search = searchQuery?.trim();
    const where = and(
      eq(bookLists.isPublic, true),
      search ? ilike(bookLists.title, `%${search}%`) : undefined,
    );

    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(bookLists)
      .where(where);

    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit,
    );

    const rows = await db
      .select({
        list: bookLists,
        owner: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          shelfSlug: users.shelfSlug,
          shelfPublic: users.shelfPublic,
        },
      })
      .from(bookLists)
      .innerJoin(users, eq(bookLists.userId, users.id))
      .where(where)
      .orderBy(
        desc(bookLists.isPromoted),
        desc(bookLists.promotedAt),
        desc(bookLists.updatedAt),
      )
      .limit(limit)
      .offset(offset);

    if (rows.length === 0) {
      return ok({ lists: [], totalPages, page, totalCount });
    }

    const listIds = rows.map((r) => r.list.id);
    const counts = await db
      .select({
        listId: bookListItems.listId,
        value: count(),
      })
      .from(bookListItems)
      .where(inArray(bookListItems.listId, listIds))
      .groupBy(bookListItems.listId);
    const countMap = new Map(counts.map((c) => [c.listId, c.value]));

    const lists = rows.map(({ list, owner }) => {
      const displayName = formatShelfOwnerName({
        firstName: owner.firstName,
        lastName: owner.lastName,
      });
      return {
        ...list,
        bookCount: countMap.get(list.id) ?? 0,
        owner: {
          id: owner.id,
          displayName,
          shelfSlug: owner.shelfSlug,
          shelfPublic: owner.shelfPublic,
        },
        canPromote: isListPromotionEligible(list, owner),
      };
    });

    return ok({ lists, totalPages, page, totalCount });
  } catch (error) {
    console.error("Failed to list public lists for admin", error);
    return err({ reason: "Failed to load lists", error });
  }
}

export async function setListPromoted(listId: string, promoted: boolean) {
  const list = await db.query.bookLists.findFirst({
    where: eq(bookLists.id, listId),
    with: {
      user: {
        columns: {
          shelfPublic: true,
          shelfSlug: true,
        },
      },
    },
  });
  if (!list) return err({ reason: "List not found" });

  if (promoted) {
    if (!isListPromotionEligible(list, list.user)) {
      return err({
        reason:
          "Only public lists on a public shelf can be promoted",
      });
    }
  }

  try {
    const [updated] = await db
      .update(bookLists)
      .set(
        promoted
          ? { isPromoted: true, promotedAt: new Date() }
          : { isPromoted: false, promotedAt: null },
      )
      .where(eq(bookLists.id, listId))
      .returning();
    if (!updated) return err({ reason: "List not found" });
    return ok(updated);
  } catch (error) {
    console.error("Failed to set list promoted", error);
    return err({ reason: "Failed to update promotion", error });
  }
}

export async function getPromotedLists(limit = 8) {
  try {
    const rows = await db
      .select({
        list: bookLists,
        owner: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          shelfSlug: users.shelfSlug,
          shelfPublic: users.shelfPublic,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(bookLists)
      .innerJoin(users, eq(bookLists.userId, users.id))
      .where(
        and(
          eq(bookLists.isPromoted, true),
          eq(bookLists.isPublic, true),
          eq(users.shelfPublic, true),
          sql`${users.shelfSlug} is not null`,
        ),
      )
      .orderBy(desc(bookLists.promotedAt), desc(bookLists.updatedAt))
      .limit(limit);

    if (rows.length === 0) return ok([]);

    const listIds = rows.map((r) => r.list.id);
    const counts = await db
      .select({
        listId: bookListItems.listId,
        value: count(),
      })
      .from(bookListItems)
      .innerJoin(books, eq(bookListItems.bookId, books.id))
      .where(
        and(inArray(bookListItems.listId, listIds), publishedBookConditions),
      )
      .groupBy(bookListItems.listId);
    const countMap = new Map(counts.map((c) => [c.listId, c.value]));

    const coverRows = await db
      .select({
        listId: bookListItems.listId,
        coverUrl: books.coverUrl,
        createdAt: bookListItems.createdAt,
      })
      .from(bookListItems)
      .innerJoin(books, eq(bookListItems.bookId, books.id))
      .where(
        and(inArray(bookListItems.listId, listIds), publishedBookConditions),
      )
      .orderBy(desc(bookListItems.createdAt));

    const coversByList = new Map<string, string[]>();
    for (const row of coverRows) {
      if (!row.coverUrl) continue;
      const existing = coversByList.get(row.listId) ?? [];
      if (existing.length >= 3) continue;
      existing.push(row.coverUrl);
      coversByList.set(row.listId, existing);
    }

    return ok(
      rows.map(({ list, owner }) => ({
        ...list,
        bookCount: countMap.get(list.id) ?? 0,
        coverUrls: coversByList.get(list.id) ?? [],
        owner: {
          id: owner.id,
          displayName: formatShelfOwnerName({
            firstName: owner.firstName,
            lastName: owner.lastName,
          }),
          shelfSlug: owner.shelfSlug!,
          profileImageUrl: owner.profileImageUrl,
        },
      })),
    );
  } catch (error) {
    console.error("Failed to get promoted lists", error);
    return err({ reason: "Failed to load promoted lists", error });
  }
}
