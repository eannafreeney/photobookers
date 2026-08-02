import { and, asc, count, desc, eq, ilike, inArray, isNull, lte, ne, or, sql } from "drizzle-orm";
import {
  BOOK_CARD_COLUMNS,
  CREATOR_CARD_COLUMNS,
} from "../../constants/queries";
import { db } from "../../db/client";
import {
  bookListItems,
  bookLists,
  books,
  users,
  type BookList,
} from "../../db/schema";
import { getBooksOrderBy } from "../../lib/booksOrderBy";
import { getPagination } from "../../lib/pagination";
import { err, ok } from "../../lib/result";
import { formatShelfOwnerName } from "../shelf/utils";
import {
  isListPromotionEligible,
  isReservedListSlug,
  listDescriptionSchema,
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

export async function listBookListsWithCounts(userId: string) {
  const lists = await listBookListsForUser(userId);
  if (lists.length === 0) return [];

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
  return lists.map((list) => ({
    ...list,
    bookCount: countMap.get(list.id) ?? 0,
  }));
}

export async function getBookListForOwner(listId: string, userId: string) {
  const list = await db.query.bookLists.findFirst({
    where: and(eq(bookLists.id, listId), eq(bookLists.userId, userId)),
  });
  if (!list) return err({ reason: "List not found" });
  return ok(list);
}

export async function getPublicListsForUser(userId: string) {
  const lists = await db.query.bookLists.findMany({
    where: and(eq(bookLists.userId, userId), eq(bookLists.isPublic, true)),
    orderBy: [desc(bookLists.updatedAt), desc(bookLists.createdAt)],
  });
  if (lists.length === 0) return [];

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
  return lists.map((list) => ({
    ...list,
    bookCount: countMap.get(list.id) ?? 0,
    coverUrls: coversByList.get(list.id) ?? [],
  }));
}

export async function getPublicListByShelfAndSlug(
  shelfSlug: string,
  listSlug: string,
) {
  const owner = await db.query.users.findFirst({
    where: and(eq(users.shelfSlug, shelfSlug), eq(users.shelfPublic, true)),
  });
  if (!owner) return err({ reason: "Shelf not found" });

  const list = await db.query.bookLists.findFirst({
    where: and(
      eq(bookLists.userId, owner.id),
      eq(bookLists.slug, listSlug),
      eq(bookLists.isPublic, true),
    ),
  });
  if (!list) return err({ reason: "List not found" });

  return ok({ owner, list });
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

    await db.insert(bookListItems).values({ listId, bookId });
    return ok({ added: true as const, list });
  } catch (error) {
    console.error("Failed to toggle list membership", error);
    return err({ reason: "Failed to update list", error });
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
      .select({ bookId: bookListItems.bookId })
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

    const listBooks = await db.query.books.findMany({
      columns: BOOK_CARD_COLUMNS,
      where: and(inArray(books.id, bookIds), publishedBookConditions),
      with: {
        artist: { columns: CREATOR_CARD_COLUMNS },
        publisher: { columns: CREATOR_CARD_COLUMNS },
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

    return ok({
      books: ordered as typeof listBooks,
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
