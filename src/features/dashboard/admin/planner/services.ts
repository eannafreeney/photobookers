import {
  getBooksOfTheWeekInRange,
  type BookOfTheWeekWithBook as AppBookOfTheWeekWithBook,
} from "../../../app/BOTWServices";
import { toWeekString } from "../../../../lib/utils";
import { getWeekStarts } from "./utils";
import {
  BookOfTheWeek,
  bookOfTheWeek,
  books,
  featuredBooksOfTheWeek,
} from "../../../../db/schema";
import { db } from "../../../../db/client";
import { and, desc, eq, gte, isNotNull, lte } from "drizzle-orm";
import {
  BOOK_CARD_COLUMNS,
  CREATOR_CARD_COLUMNS,
} from "../../../../constants/queries";

export async function getAllBooksPreview() {
  return db.query.books.findMany({
    columns: {
      id: true,
      title: true,
      coverUrl: true,
      description: true,
    },
    with: {
      artist: {
        columns: {
          id: true,
          displayName: true,
        },
      },
      publisher: {
        columns: {
          id: true,
          displayName: true,
        },
      },
    },
    where: and(eq(books.approvalStatus, "approved"), isNotNull(books.coverUrl)),
  });
}

export async function getBotwByWeekStart(
  year: number,
): Promise<Map<string, AppBookOfTheWeekWithBook>> {
  const weekStarts = getWeekStarts(year);
  if (weekStarts.length === 0) return new Map();

  const [first, last] = [weekStarts[0], weekStarts[weekStarts.length - 1]];
  const entries = await getBooksOfTheWeekInRange(first, last);

  return new Map(entries.map((b) => [toWeekString(b.weekStart), b]));
}

/** Normalize to start of day UTC for consistent storage/comparison */
function toWeekStart(d: Date): Date {
  const date = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  const day = date.getUTCDay();
  const daysToMonday = day === 0 ? 6 : day - 1;
  date.setUTCDate(date.getUTCDate() - daysToMonday);
  return date;
}

export async function setBookOfTheWeek(params: {
  weekStart: Date;
  bookId: string;
}): Promise<BookOfTheWeek | null> {
  const weekStart = toWeekStart(params.weekStart);
  try {
    const [row] = await db
      .insert(bookOfTheWeek)
      .values({
        weekStart,
        bookId: params.bookId,
        text: "",
      })
      .returning();
    return row ?? null;
  } catch (e) {
    // uniqueDate or uniqueBook violation
    console.error("setBookOfTheWeek", e);
    return null;
  }
}

export async function updateBookOfTheWeek(params: {
  weekStart: Date;
  bookId: string;
  text: string;
}): Promise<BookOfTheWeek | null> {
  const weekStart = toWeekStart(params.weekStart);
  try {
    const [row] = await db
      .insert(bookOfTheWeek)
      .values({
        weekStart,
        bookId: params.bookId,
        text: params.text,
      })
      .returning();
    return row ?? null;
  } catch (e) {
    // uniqueDate or uniqueBook violation
    console.error("setBookOfTheWeek", e);
    return null;
  }
}

export type BookOfTheWeekWithBook = Awaited<
  ReturnType<typeof getBookOfTheWeekForDateQuery>
>;

export async function getBookOfTheWeekForDateQuery(date: Date) {
  const weekStart = toWeekStart(date);
  const book = await db.query.bookOfTheWeek.findFirst({
    where: eq(bookOfTheWeek.weekStart, weekStart),
    with: {
      book: {
        columns: {
          id: true,
          title: true,
          slug: true,
          coverUrl: true,
          artistId: true,
          publisherId: true,
        },
        with: {
          artist: {
            columns: {
              id: true,
              displayName: true,
              slug: true,
            },
          },
          publisher: {
            columns: {
              id: true,
              displayName: true,
              slug: true,
            },
          },
          images: {
            columns: {
              id: true,
              imageUrl: true,
            },
            orderBy: (bookImages, { asc }) => [asc(bookImages.sortOrder)],
          },
        },
      },
    },
  });
  if (!book) return null;

  return book;
}

export async function getThisWeeksBookOfTheWeek(): Promise<BookOfTheWeekWithBook> {
  return getBookOfTheWeekForDateQuery(new Date());
}

export async function getRecentBooksOfTheWeek(limit = 20) {
  return db.query.bookOfTheWeek.findMany({
    orderBy: [desc(bookOfTheWeek.weekStart)],
    limit,
    with: { book: true },
  });
}

export async function deleteBookOfTheWeekByIdAdmin(bookId: string) {
  try {
    return db
      .delete(bookOfTheWeek)
      .where(eq(bookOfTheWeek.bookId, bookId))
      .returning();
  } catch (e) {
    console.error("deleteBookOfTheWeekByIdAdmin", e);
    return null;
  }
}

export type FeaturedBookOfTheWeekWithBook = Awaited<
  ReturnType<typeof getFeaturedBooksForWeekQuery>
>[number];

export async function getFeaturedBooksForWeekQuery(weekStart: Date) {
  const normalized = toWeekStart(weekStart);
  return db.query.featuredBooksOfTheWeek.findMany({
    where: eq(featuredBooksOfTheWeek.weekStart, normalized),
    orderBy: [featuredBooksOfTheWeek.position],
    with: {
      book: {
        columns: BOOK_CARD_COLUMNS,
        with: {
          artist: { columns: CREATOR_CARD_COLUMNS },
          publisher: { columns: CREATOR_CARD_COLUMNS },
        },
      },
    },
  });
}

export async function getFeaturedBooksByWeekStart(
  year: number,
): Promise<Map<string, FeaturedBookOfTheWeekWithBook[]>> {
  const weekStarts = getWeekStarts(year);
  if (weekStarts.length === 0) return new Map();
  const [first, last] = [weekStarts[0], weekStarts[weekStarts.length - 1]];
  const entries = await db.query.featuredBooksOfTheWeek.findMany({
    where: and(
      gte(featuredBooksOfTheWeek.weekStart, toWeekStart(first)),
      lte(featuredBooksOfTheWeek.weekStart, toWeekStart(last)),
    ),
    orderBy: [
      featuredBooksOfTheWeek.weekStart,
      featuredBooksOfTheWeek.position,
    ],
    with: {
      book: {
        columns: BOOK_CARD_COLUMNS,
        with: {
          artist: { columns: CREATOR_CARD_COLUMNS },
          publisher: { columns: CREATOR_CARD_COLUMNS },
        },
      },
    },
  });
  const byWeek = new Map<string, FeaturedBookOfTheWeekWithBook[]>();
  for (const e of entries) {
    const key = toWeekString(e.weekStart);
    if (!byWeek.has(key)) byWeek.set(key, []);
    byWeek.get(key)!.push(e);
  }
  return byWeek;
}

export async function setFeaturedBooksForWeek(
  weekStart: Date,
  bookIds: [string, string, string, string, string],
): Promise<{ ok: boolean; error?: string }> {
  const normalized = toWeekStart(weekStart);
  await db
    .delete(featuredBooksOfTheWeek)
    .where(eq(featuredBooksOfTheWeek.weekStart, normalized));
  const uniqueIds = [...new Set(bookIds)];
  if (uniqueIds.length !== 5)
    return { ok: false, error: "Exactly 5 unique books required" };
  try {
    await db.insert(featuredBooksOfTheWeek).values(
      uniqueIds.map((bookId, i) => ({
        weekStart: normalized,
        bookId,
        position: i + 1,
      })),
    );
    return { ok: true };
  } catch (e) {
    // unique book_id violation = one of the books was already featured
    console.error("setFeaturedBooksForWeek", e);
    return {
      ok: false,
      error: "One or more books have already been featured.",
    };
  }
}
