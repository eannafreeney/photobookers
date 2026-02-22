import { db } from "../db/client";
import { Book, bookOfTheDay, type BookOfTheDay } from "../db/schema";
import { eq, desc, sql } from "drizzle-orm";

/** Normalize to start of day UTC for consistent storage/comparison */
function toDayStart(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

export async function setBookOfTheDay(params: {
  date: Date;
  bookId: string;
  text: string;
}): Promise<BookOfTheDay | null> {
  const dayStart = toDayStart(params.date);
  try {
    const [row] = await db
      .insert(bookOfTheDay)
      .values({
        date: dayStart,
        bookId: params.bookId,
        text: params.text,
      })
      .returning();
    return row ?? null;
  } catch (e) {
    // uniqueDate or uniqueBook violation
    console.error("setBookOfTheDay", e);
    return null;
  }
}

export type BookOfTheDayWithBook = Awaited<
  ReturnType<typeof getBookOfTheDayForDateQuery>
>;

export async function getBookOfTheDayForDateQuery(date: Date) {
  const dayStart = toDayStart(date);
  const book = await db.query.bookOfTheDay.findFirst({
    where: eq(bookOfTheDay.date, dayStart),
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

export async function getTodaysBookOfTheDay(): Promise<BookOfTheDayWithBook> {
  return getBookOfTheDayForDateQuery(new Date());
}

export async function getRecentBooksOfTheDay(limit = 20) {
  return db.query.bookOfTheDay.findMany({
    orderBy: [desc(bookOfTheDay.date)],
    limit,
    with: { book: true },
  });
}
