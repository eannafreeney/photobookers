import {
  getBooksOfTheDayInRange
} from "../../../app/BOTDServices.js";
import {
  toDateString,
  toUtcStartOfDay,
  toWeekStart,
  toWeekString
} from "../../../../lib/utils.js";
import { getWeekDays, getWeekStarts } from "./utils.js";
import {
  artistOfTheWeek,
  bookOfTheDay,
  books,
  creators,
  publisherOfTheWeek
} from "../../../../db/schema.js";
import { db } from "../../../../db/client.js";
import { and, asc, desc, eq, gte, inArray, lte, notInArray, sql } from "drizzle-orm";
import {
  BOOK_CARD_COLUMNS,
  CREATOR_CARD_COLUMNS
} from "../../../../constants/queries.js";
import { err, ok } from "../../../../lib/result.js";
async function getAllBooksPreview() {
  return db.query.books.findMany({
    columns: {
      id: true,
      title: true,
      coverUrl: true
    },
    with: {
      artist: {
        columns: {
          id: true,
          displayName: true
        }
      },
      publisher: {
        columns: {
          id: true,
          displayName: true
        }
      }
    },
    where: and(
      eq(books.approvalStatus, "approved"),
      eq(books.publicationStatus, "published")
    )
  });
}
async function getAllBooksForBOTD() {
  const usedBookIds = db.select({ bookId: bookOfTheDay.bookId }).from(bookOfTheDay);
  return db.query.books.findMany({
    columns: {
      id: true,
      title: true,
      coverUrl: true
    },
    with: {
      artist: {
        columns: {
          id: true,
          displayName: true
        }
      },
      publisher: {
        columns: {
          id: true,
          displayName: true
        }
      }
    },
    where: and(
      eq(books.approvalStatus, "approved"),
      eq(books.publicationStatus, "published"),
      notInArray(books.id, usedBookIds)
    )
  });
}
async function getBotdByDate(year) {
  const weekStarts = getWeekStarts(year);
  if (weekStarts.length === 0) return /* @__PURE__ */ new Map();
  const first = weekStarts[0];
  const lastMon = weekStarts[weekStarts.length - 1];
  const last = new Date(lastMon);
  last.setUTCDate(last.getUTCDate() + 6);
  const [error, result] = await getBooksOfTheDayInRange(first, last);
  if (error) return /* @__PURE__ */ new Map();
  const { botdEntries } = result;
  return new Map(botdEntries.map((b) => [toDateString(b.date), b]));
}
async function setBookOfTheDay(params) {
  const day = toUtcStartOfDay(params.date);
  try {
    const [row] = await db.insert(bookOfTheDay).values({
      date: day,
      bookId: params.bookId
    }).returning();
    if (!row) return err({ reason: "Failed to set book of the day" });
    return ok(row);
  } catch (e) {
    console.error("setBookOfTheDay", e);
    return err({ reason: "Failed to set book of the day" });
  }
}
async function updateBookOfTheDayByDate(date, patch) {
  const day = toUtcStartOfDay(date);
  const updateData = { updatedAt: /* @__PURE__ */ new Date() };
  if (patch.bookId !== void 0) updateData.bookId = patch.bookId;
  if (patch.artistEmailSentAt !== void 0)
    updateData.artistEmailSentAt = patch.artistEmailSentAt;
  if (patch.publisherEmailSentAt !== void 0)
    updateData.publisherEmailSentAt = patch.publisherEmailSentAt;
  if (patch.artistFeatureDayEmailSentAt !== void 0)
    updateData.artistFeatureDayEmailSentAt = patch.artistFeatureDayEmailSentAt;
  if (patch.publisherFeatureDayEmailSentAt !== void 0)
    updateData.publisherFeatureDayEmailSentAt = patch.publisherFeatureDayEmailSentAt;
  try {
    const [row] = await db.update(bookOfTheDay).set(updateData).where(eq(bookOfTheDay.date, day)).returning();
    if (!row) return err({ reason: "Book of the day not found" });
    return ok(row);
  } catch (e) {
    console.error("updateBookOfTheDayByDate", e);
    return err({ reason: "Failed to update book of the day" });
  }
}
async function deleteBookOfTheDayByDate(date) {
  try {
    const [row] = await db.delete(bookOfTheDay).where(eq(bookOfTheDay.date, toUtcStartOfDay(date))).returning();
    if (!row) return err({ reason: "Failed to delete book of the day" });
    return ok(row);
  } catch (e) {
    console.error("deleteBookOfTheDayByDate", e);
    return err({ reason: "Failed to delete book of the day" });
  }
}
async function getBookOfTheDayForDateQuery(date) {
  const day = toUtcStartOfDay(date);
  try {
    const row = await db.query.bookOfTheDay.findFirst({
      where: eq(bookOfTheDay.date, day),
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
    if (!row) return err({ reason: "Book of the day not found" });
    return ok(row);
  } catch (e) {
    console.error("getBookOfTheDayForDateQuery", e);
    return err({ reason: "Failed to get book of the day for date" });
  }
}
async function getTodaysBookOfTheDay() {
  return getBookOfTheDayForDateQuery(/* @__PURE__ */ new Date());
}
async function updateArtistOfTheWeekByWeekStart(weekStart) {
  const normalizedWeekStart = toWeekStart(weekStart);
  try {
    const [row] = await db.update(artistOfTheWeek).set({ emailSentAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where(eq(artistOfTheWeek.weekStart, normalizedWeekStart)).returning();
    if (!row) return err({ reason: "Artist of the week not found" });
    return ok(row);
  } catch (e) {
    console.error("updateArtistOfTheWeekByWeekStart", e);
    return err({ reason: "Failed to update artist of the week" });
  }
}
async function updatePublisherOfTheWeekByWeekStart(weekStart) {
  const normalizedWeekStart = toWeekStart(weekStart);
  try {
    const [row] = await db.update(publisherOfTheWeek).set({ emailSentAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where(eq(publisherOfTheWeek.weekStart, normalizedWeekStart)).returning();
    if (!row) return err({ reason: "Publisher of the week not found" });
    return ok(row);
  } catch (e) {
    console.error("updatePublisherOfTheWeekByWeekStart", e);
    return err({ reason: "Failed to update publisher of the week" });
  }
}
async function getArtistOfTheWeekForDateQuery(date) {
  const weekStart = toWeekStart(date);
  try {
    const artist = await db.query.artistOfTheWeek.findFirst({
      where: eq(artistOfTheWeek.weekStart, weekStart),
      with: {
        creator: {
          columns: CREATOR_CARD_COLUMNS
        }
      }
    });
    if (!artist) return err({ reason: "Artist of the week not found" });
    return ok(artist);
  } catch (e) {
    console.error("getArtistOfTheWeekForDateQuery", e);
    return err({ reason: "Failed to get artist of the week for date" });
  }
}
async function getArtistsOfTheWeekByWeekStart(year) {
  const weekStarts = getWeekStarts(year);
  if (weekStarts.length === 0)
    return ok(/* @__PURE__ */ new Map());
  try {
    const [first, last] = [weekStarts[0], weekStarts[weekStarts.length - 1]];
    const entries = await db.query.artistOfTheWeek.findMany({
      where: and(
        gte(artistOfTheWeek.weekStart, toWeekStart(first)),
        lte(artistOfTheWeek.weekStart, toWeekStart(last))
      ),
      with: { creator: { columns: CREATOR_CARD_COLUMNS } }
    });
    const byWeek = /* @__PURE__ */ new Map();
    for (const w of weekStarts) {
      const key = toWeekString(w);
      const entry = entries.find((e) => toWeekString(e.weekStart) === key) ?? null;
      byWeek.set(key, entry);
    }
    return ok(byWeek);
  } catch (e) {
    console.error("getArtistsOfTheWeekByWeekStart", e);
    return err({ reason: "Failed to get artists of the week by week start" });
  }
}
async function setArtistOfTheWeek(params) {
  const weekStart = toWeekStart(params.weekStart);
  try {
    const [row] = await db.insert(artistOfTheWeek).values({
      weekStart,
      creatorId: params.creatorId
    }).returning();
    return row ?? null;
  } catch (e) {
    console.error("setArtistOfTheWeek", e);
    return null;
  }
}
async function updateArtistOfTheWeek(params) {
  const weekStart = toWeekStart(params.weekStart);
  try {
    await db.delete(artistOfTheWeek).where(eq(artistOfTheWeek.weekStart, weekStart));
    const [row] = await db.insert(artistOfTheWeek).values({
      weekStart,
      creatorId: params.creatorId
    }).returning();
    if (!row) return err({ reason: "Failed to update artist of the week" });
    return ok(row);
  } catch (e) {
    console.error("updateArtistOfTheWeek", e);
    return err({ reason: "Failed to update artist of the week" });
  }
}
async function deleteArtistOfTheWeekByWeekStart(weekStart) {
  try {
    const [row] = await db.delete(artistOfTheWeek).where(eq(artistOfTheWeek.weekStart, toWeekStart(weekStart))).returning();
    if (!row) return err({ reason: "Failed to delete artist of the week" });
    return ok(row);
  } catch (e) {
    console.error("deleteArtistOfTheWeekByWeek", e);
    return err({ reason: "Failed to delete artist of the week" });
  }
}
async function getPublisherOfTheWeekForDateQuery(date) {
  const weekStart = toWeekStart(date);
  try {
    const publisher = await db.query.publisherOfTheWeek.findFirst({
      where: eq(publisherOfTheWeek.weekStart, weekStart),
      with: {
        creator: { columns: CREATOR_CARD_COLUMNS }
      }
    });
    if (!publisher) return err({ reason: "Publisher of the week not found" });
    return ok(publisher);
  } catch (e) {
    console.error("getPublisherOfTheWeekForDateQuery", e);
    return err({ reason: "Failed to get publisher of the week for date" });
  }
}
async function getPublishersOfTheWeekByWeekStart(year) {
  const weekStarts = getWeekStarts(year);
  if (weekStarts.length === 0)
    return ok(/* @__PURE__ */ new Map());
  try {
    const [first, last] = [weekStarts[0], weekStarts[weekStarts.length - 1]];
    const entries = await db.query.publisherOfTheWeek.findMany({
      where: and(
        gte(publisherOfTheWeek.weekStart, toWeekStart(first)),
        lte(publisherOfTheWeek.weekStart, toWeekStart(last))
      ),
      with: { creator: { columns: CREATOR_CARD_COLUMNS } }
    });
    const byWeek = /* @__PURE__ */ new Map();
    for (const w of weekStarts) {
      const key = toWeekString(w);
      const entry = entries.find((e) => toWeekString(e.weekStart) === key) ?? null;
      byWeek.set(key, entry);
    }
    return ok(byWeek);
  } catch (e) {
    console.error("getPublishersOfTheWeekByWeekStart", e);
    return err({
      reason: "Failed to get publishers of the week by week start"
    });
  }
}
async function setPublisherOfTheWeek(params) {
  const weekStart = toWeekStart(params.weekStart);
  try {
    const [row] = await db.insert(publisherOfTheWeek).values({
      weekStart,
      creatorId: params.creatorId
    }).returning();
    if (!row) return err({ reason: "Failed to set publisher of the week" });
    return ok(row);
  } catch (e) {
    console.error("setPublisherOfTheWeek", e);
    return err({ reason: "Failed to set publisher of the week" });
  }
}
async function updatePublisherOfTheWeek(params) {
  const weekStart = toWeekStart(params.weekStart);
  try {
    await db.delete(publisherOfTheWeek).where(eq(publisherOfTheWeek.weekStart, weekStart));
    const [row] = await db.insert(publisherOfTheWeek).values({
      weekStart,
      creatorId: params.creatorId
    }).returning();
    if (!row) return err({ reason: "Failed to update publisher of the week" });
    return ok(row);
  } catch (e) {
    console.error("updatePublisherOfTheWeek", e);
    return err({ reason: "Failed to update publisher of the week" });
  }
}
async function deletePublisherOfTheWeekByWeekStart(weekStart) {
  try {
    const [row] = await db.delete(publisherOfTheWeek).where(eq(publisherOfTheWeek.weekStart, toWeekStart(weekStart))).returning();
    if (!row) return err({ reason: "Failed to delete publisher of the week" });
    return ok(row);
  } catch (e) {
    console.error("deletePublisherOfTheWeekByWeek", e);
    return err({ reason: "Failed to delete publisher of the week" });
  }
}
function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
async function randomizeBooksOfTheDayForWeek(weekStart) {
  const days = getWeekDays(weekStart);
  const existing = await db.query.bookOfTheDay.findMany({
    columns: { date: true },
    where: inArray(
      bookOfTheDay.date,
      days.map((day) => toUtcStartOfDay(day))
    ),
    with: {
      book: {
        columns: { id: true },
        with: {
          artist: { columns: { id: true } },
          publisher: { columns: { id: true } }
        }
      }
    }
  });
  const scheduledDates = new Set(
    existing.map((entry) => toDateString(entry.date))
  );
  const emptyDays = days.filter(
    (day) => !scheduledDates.has(toDateString(day))
  );
  if (emptyDays.length === 0) {
    return err({
      reason: "This week already has Books of the Day scheduled for every day"
    });
  }
  const usedArtistIds = /* @__PURE__ */ new Set();
  const usedPublisherIds = /* @__PURE__ */ new Set();
  for (const entry of existing) {
    const artistId = entry.book?.artist?.id;
    const publisherId = entry.book?.publisher?.id;
    if (artistId) usedArtistIds.add(artistId);
    if (publisherId) usedPublisherIds.add(publisherId);
  }
  const availableBooks = await getAllBooksForBOTD();
  const remaining = shuffle(availableBooks);
  const pickedBooks = [];
  for (const _day of emptyDays) {
    const index = remaining.findIndex((book2) => {
      const artistId = book2.artist?.id;
      const publisherId = book2.publisher?.id;
      return (!artistId || !usedArtistIds.has(artistId)) && (!publisherId || !usedPublisherIds.has(publisherId));
    });
    if (index === -1) {
      const remainingCount = emptyDays.length - pickedBooks.length;
      return err({
        reason: `Not enough books with unique artists and publishers to fill ${remainingCount} open day${remainingCount === 1 ? "" : "s"} in this week`
      });
    }
    const [book] = remaining.splice(index, 1);
    pickedBooks.push(book);
    if (book.artist?.id) usedArtistIds.add(book.artist.id);
    if (book.publisher?.id) usedPublisherIds.add(book.publisher.id);
  }
  const assignments = emptyDays.map((day, index) => ({
    date: toUtcStartOfDay(day),
    bookId: pickedBooks[index].id
  }));
  try {
    const rows = await db.transaction(async (tx) => {
      const inserted = [];
      for (const assignment of assignments) {
        const [row] = await tx.insert(bookOfTheDay).values(assignment).returning();
        if (!row) throw new Error("Failed to insert book of the day");
        inserted.push(row);
      }
      return inserted;
    });
    return ok({ scheduled: rows.length });
  } catch (e) {
    console.error("randomizeBooksOfTheDayForWeek", e);
    return err({ reason: "Failed to schedule random Books of the Day" });
  }
}
async function getCreatorsByTypeForPlanner(type) {
  const usedCreatorIds = type === "artist" ? db.select({ creatorId: artistOfTheWeek.creatorId }).from(artistOfTheWeek) : db.select({ creatorId: publisherOfTheWeek.creatorId }).from(publisherOfTheWeek);
  return db.query.creators.findMany({
    columns: {
      id: true,
      displayName: true,
      coverUrl: true,
      slug: true,
      status: true
    },
    where: and(
      eq(creators.type, type),
      notInArray(creators.id, usedCreatorIds)
    ),
    orderBy: (c) => [desc(sql`(${c.status} = 'verified')`), asc(c.displayName)]
  });
}
export {
  deleteArtistOfTheWeekByWeekStart,
  deleteBookOfTheDayByDate,
  deletePublisherOfTheWeekByWeekStart,
  getAllBooksForBOTD,
  getAllBooksPreview,
  getArtistOfTheWeekForDateQuery,
  getArtistsOfTheWeekByWeekStart,
  getBookOfTheDayForDateQuery,
  getBotdByDate,
  getCreatorsByTypeForPlanner,
  getPublisherOfTheWeekForDateQuery,
  getPublishersOfTheWeekByWeekStart,
  getTodaysBookOfTheDay,
  randomizeBooksOfTheDayForWeek,
  setArtistOfTheWeek,
  setBookOfTheDay,
  setPublisherOfTheWeek,
  updateArtistOfTheWeek,
  updateArtistOfTheWeekByWeekStart,
  updateBookOfTheDayByDate,
  updatePublisherOfTheWeek,
  updatePublisherOfTheWeekByWeekStart
};
