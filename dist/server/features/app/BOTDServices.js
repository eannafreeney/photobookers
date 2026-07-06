import {
  BOOK_CARD_COLUMNS,
  CREATOR_CARD_COLUMNS
} from "../../constants/queries.js";
import { db } from "../../db/client.js";
import { bookOfTheDay } from "../../db/schema.js";
import { eq, desc, count, lte } from "drizzle-orm";
import { err, ok } from "../../lib/result.js";
import { getPagination } from "../../lib/pagination.js";
import { toUtcStartOfDay } from "../../lib/utils.js";
async function getBookOfTheDayForDate(date) {
  const day = toUtcStartOfDay(date);
  try {
    const row = await db.query.bookOfTheDay.findFirst({
      where: eq(bookOfTheDay.date, day),
      with: {
        book: {
          columns: BOOK_CARD_COLUMNS,
          with: {
            artist: { columns: CREATOR_CARD_COLUMNS },
            publisher: { columns: CREATOR_CARD_COLUMNS },
            images: {
              columns: { id: true, imageUrl: true },
              orderBy: (bookImages, { asc }) => [asc(bookImages.sortOrder)]
            }
          }
        }
      }
    });
    if (!row) return err({ reason: "Book of the day not found" });
    return ok(row);
  } catch (error) {
    console.error("getBookOfTheDayForDate", error);
    return err({ reason: "Failed to get book of the day for date" });
  }
}
async function getTodaysBookOfTheDay() {
  return getBookOfTheDayForDate(/* @__PURE__ */ new Date());
}
async function getRecentBooksOfTheDay(currentPage = 1, defaultLimit = 12) {
  const today = toUtcStartOfDay(/* @__PURE__ */ new Date());
  try {
    const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(bookOfTheDay);
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit
    );
    const rows = await db.query.bookOfTheDay.findMany({
      where: lte(bookOfTheDay.date, today),
      orderBy: [desc(bookOfTheDay.date)],
      limit,
      offset,
      with: {
        book: {
          columns: BOOK_CARD_COLUMNS,
          with: {
            artist: { columns: CREATOR_CARD_COLUMNS },
            publisher: { columns: CREATOR_CARD_COLUMNS }
          }
        }
      }
    });
    if (rows.length === 0) return ok({ botdEntries: [], totalPages, page });
    return ok({ botdEntries: rows, totalPages, page });
  } catch (error) {
    console.error("getRecentBooksOfTheDay", error);
    return err({
      reason: "Failed to get recent books of the day",
      cause: error
    });
  }
}
async function getBooksOfTheDayInRange(start, end) {
  const dayMin = toUtcStartOfDay(start);
  const dayMax = toUtcStartOfDay(end);
  try {
    const rows = await db.query.bookOfTheDay.findMany({
      where: (table, { and, gte: gteOp, lte: lteOp }) => and(gteOp(table.date, dayMin), lteOp(table.date, dayMax)),
      orderBy: [bookOfTheDay.date],
      with: {
        book: {
          columns: BOOK_CARD_COLUMNS,
          with: {
            artist: { columns: CREATOR_CARD_COLUMNS },
            publisher: { columns: CREATOR_CARD_COLUMNS },
            images: {
              columns: { id: true, imageUrl: true },
              orderBy: (bookImages, { asc }) => [asc(bookImages.sortOrder)]
            }
          }
        }
      }
    });
    if (rows.length === 0) return ok({ botdEntries: [] });
    return ok({ botdEntries: rows });
  } catch (error) {
    console.error("getBooksOfTheDayInRange", error);
    return err({
      reason: "Failed to get books of the day in range",
      cause: error
    });
  }
}
export {
  getBookOfTheDayForDate,
  getBooksOfTheDayInRange,
  getRecentBooksOfTheDay,
  getTodaysBookOfTheDay
};
