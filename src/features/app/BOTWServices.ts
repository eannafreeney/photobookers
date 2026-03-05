import { BOOK_CARD_COLUMNS } from "../../constants/queries";
import { CREATOR_CARD_COLUMNS } from "../../constants/queries";
import { db } from "../../db/client";
import { bookOfTheWeek, BookOfTheWeek } from "../../db/schema";
import { eq, desc, sql } from "drizzle-orm";

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
        columns: BOOK_CARD_COLUMNS,
        with: {
          artist: {
            columns: CREATOR_CARD_COLUMNS,
          },
          publisher: {
            columns: CREATOR_CARD_COLUMNS,
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
