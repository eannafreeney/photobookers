import {
  getBooksOfTheWeekInRange,
  type BookOfTheWeekWithBook as AppBookOfTheWeekWithBook,
} from "../../../app/BOTWServices";
import { toWeekString } from "../../../../lib/utils";
import { getWeekStarts } from "./utils";
import {
  artistOfTheWeek,
  BookOfTheWeek,
  bookOfTheWeek,
  books,
  creators,
  featuredBooksOfTheWeek,
  publisherOfTheWeek,
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

export async function getBookOfTheWeekForDateQuery(
  date: Date,
): Promise<BookOfTheWeek | null> {
  const weekStart = toWeekStart(date);
  const row = await db.query.bookOfTheWeek.findFirst({
    where: eq(bookOfTheWeek.weekStart, weekStart),
    with: {
      book: {
        columns: BOOK_CARD_COLUMNS,
        with: {
          artist: { columns: CREATOR_CARD_COLUMNS },
          publisher: { columns: CREATOR_CARD_COLUMNS },
          // images: {
          //   columns: {
          //     id: true,
          //     imageUrl: true,
          //   },
          //   orderBy: (bookImages, { asc }) => [asc(bookImages.sortOrder)],
          // },
        },
      },
    },
  });
  return row ?? null;
}

export async function getThisWeeksBookOfTheWeek(): Promise<BookOfTheWeek | null> {
  return getBookOfTheWeekForDateQuery(new Date());
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

// ----- Artist of the week -----
export type ArtistOfTheWeekWithCreator = Awaited<
  ReturnType<typeof getArtistOfTheWeekForDateQuery>
>;
export async function getArtistOfTheWeekForDateQuery(date: Date) {
  const weekStart = toWeekStart(date);
  return db.query.artistOfTheWeek.findFirst({
    where: eq(artistOfTheWeek.weekStart, weekStart),
    with: {
      creator: {
        columns: CREATOR_CARD_COLUMNS,
      },
    },
  });
}
export async function getArtistsOfTheWeekByWeekStart(year: number) {
  const weekStarts = getWeekStarts(year);
  if (weekStarts.length === 0)
    return new Map<string, ArtistOfTheWeekWithCreator | null>();
  const [first, last] = [weekStarts[0], weekStarts[weekStarts.length - 1]];
  const entries = await db.query.artistOfTheWeek.findMany({
    where: and(
      gte(artistOfTheWeek.weekStart, toWeekStart(first)),
      lte(artistOfTheWeek.weekStart, toWeekStart(last)),
    ),
    with: { creator: { columns: CREATOR_CARD_COLUMNS } },
  });
  const byWeek = new Map<string, ArtistOfTheWeekWithCreator | null>();
  for (const w of weekStarts) {
    const key = toWeekString(w);
    const entry =
      entries.find((e) => toWeekString(e.weekStart) === key) ?? null;
    byWeek.set(key, entry);
  }
  return byWeek;
}
export async function setArtistOfTheWeek(params: {
  weekStart: Date;
  creatorId: string;
  text: string;
}) {
  const weekStart = toWeekStart(params.weekStart);
  try {
    const [row] = await db
      .insert(artistOfTheWeek)
      .values({
        weekStart,
        creatorId: params.creatorId,
        text: params.text ?? "",
      })
      .returning();
    return row ?? null;
  } catch (e) {
    console.error("setArtistOfTheWeek", e);
    return null;
  }
}
export async function updateArtistOfTheWeek(params: {
  weekStart: Date;
  creatorId: string;
  text: string;
}) {
  const weekStart = toWeekStart(params.weekStart);
  try {
    await db
      .delete(artistOfTheWeek)
      .where(eq(artistOfTheWeek.weekStart, weekStart));
    const [row] = await db
      .insert(artistOfTheWeek)
      .values({
        weekStart,
        creatorId: params.creatorId,
        text: params.text ?? "",
      })
      .returning();
    return row ?? null;
  } catch (e) {
    console.error("updateArtistOfTheWeek", e);
    return null;
  }
}
export async function deleteArtistOfTheWeekByWeek(weekStart: Date) {
  try {
    return db
      .delete(artistOfTheWeek)
      .where(eq(artistOfTheWeek.weekStart, toWeekStart(weekStart)))
      .returning();
  } catch (e) {
    console.error("deleteArtistOfTheWeekByWeek", e);
    return null;
  }
}
// ----- Publisher of the week -----
export type PublisherOfTheWeekWithCreator = Awaited<
  ReturnType<typeof getPublisherOfTheWeekForDateQuery>
>;

export async function getPublisherOfTheWeekForDateQuery(date: Date) {
  const weekStart = toWeekStart(date);
  return db.query.publisherOfTheWeek.findFirst({
    where: eq(publisherOfTheWeek.weekStart, weekStart),
    with: {
      creator: { columns: CREATOR_CARD_COLUMNS },
    },
  });
}

export async function getPublishersOfTheWeekByWeekStart(year: number) {
  const weekStarts = getWeekStarts(year);
  if (weekStarts.length === 0)
    return new Map<string, PublisherOfTheWeekWithCreator | null>();
  const [first, last] = [weekStarts[0], weekStarts[weekStarts.length - 1]];
  const entries = await db.query.publisherOfTheWeek.findMany({
    where: and(
      gte(publisherOfTheWeek.weekStart, toWeekStart(first)),
      lte(publisherOfTheWeek.weekStart, toWeekStart(last)),
    ),
    with: { creator: { columns: CREATOR_CARD_COLUMNS } },
  });
  const byWeek = new Map<string, PublisherOfTheWeekWithCreator | null>();
  for (const w of weekStarts) {
    const key = toWeekString(w);
    const entry =
      entries.find((e) => toWeekString(e.weekStart) === key) ?? null;
    byWeek.set(key, entry);
  }
  return byWeek;
}
export async function setPublisherOfTheWeek(params: {
  weekStart: Date;
  creatorId: string;
  text: string;
}) {
  const weekStart = toWeekStart(params.weekStart);
  try {
    const [row] = await db
      .insert(publisherOfTheWeek)
      .values({
        weekStart,
        creatorId: params.creatorId,
        text: params.text ?? "",
      })
      .returning();
    return row ?? null;
  } catch (e) {
    console.error("setPublisherOfTheWeek", e);
    return null;
  }
}
export async function updatePublisherOfTheWeek(params: {
  weekStart: Date;
  creatorId: string;
  text: string;
}) {
  const weekStart = toWeekStart(params.weekStart);
  try {
    await db
      .delete(publisherOfTheWeek)
      .where(eq(publisherOfTheWeek.weekStart, weekStart));
    const [row] = await db
      .insert(publisherOfTheWeek)
      .values({
        weekStart,
        creatorId: params.creatorId,
        text: params.text ?? "",
      })
      .returning();
    return row ?? null;
  } catch (e) {
    console.error("updatePublisherOfTheWeek", e);
    return null;
  }
}
export async function deletePublisherOfTheWeekByWeek(weekStart: Date) {
  try {
    return db
      .delete(publisherOfTheWeek)
      .where(eq(publisherOfTheWeek.weekStart, toWeekStart(weekStart)))
      .returning();
  } catch (e) {
    console.error("deletePublisherOfTheWeekByWeek", e);
    return null;
  }
}

export async function getCreatorsByTypeForPlanner(
  type: "artist" | "publisher",
) {
  return db.query.creators.findMany({
    columns: {
      id: true,
      displayName: true,
      coverUrl: true,
      slug: true,
    },
    where: eq(creators.type, type),
    orderBy: (c, { asc }) => [asc(c.displayName)],
  });
}
