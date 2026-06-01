import { and, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import { db } from "../../../../db/client";
import { bookOfTheDay } from "../../../../db/schema";
import { err, ok, type Result } from "../../../../lib/result";
import { toDateString, toUtcStartOfDay, toWeekStart, toWeekString } from "../../../../lib/utils";
import { getWeekStarts, getWeekDays } from "./utils";
import { getBooksOfTheDayInRange } from "../../../app/BOTDServices";
import { bufferCreateScheduledImagePost } from "./buffer";
import { buildDefaultInstagramFirstComment } from "./instagramCaption";
import {
  BOOK_CARD_COLUMNS,
  CREATOR_CARD_COLUMNS,
} from "../../../../constants/queries";
import {
  buildInstagramDueAt,
  isWeekInstagramFullyPrepared,
  type PrepareInstagramEntry,
} from "./instagramUtils";

export type { PrepareInstagramEntry } from "./instagramUtils";
export {
  buildInstagramDueAt,
  isWeekInstagramFullyPrepared,
  parsePrepareInstagramFormEntries,
} from "./instagramUtils";

export async function getWeekBotdEntriesForInstagram(weekStart: Date) {
  const weekEnd = getWeekDays(weekStart)[6];
  return getBooksOfTheDayInRange(weekStart, weekEnd);
}

export async function saveWeekInstagramPreparation(
  weekStart: Date,
  entries: PrepareInstagramEntry[],
): Promise<Result<{ saved: number }, { reason: string }>> {
  const normalizedWeekStart = toWeekStart(weekStart);
  const weekEnd = getWeekDays(normalizedWeekStart)[6];

  const [loadError, weekData] = await getBooksOfTheDayInRange(
    normalizedWeekStart,
    weekEnd,
  );
  if (loadError) return err({ reason: loadError.reason });

  const allowedDates = new Set(
    weekData.botdEntries.map((entry) => toDateString(entry.date)),
  );

  const now = new Date();
  try {
    let saved = 0;
    for (const entry of entries) {
      const dateKey = toDateString(toUtcStartOfDay(entry.date));
      if (!allowedDates.has(dateKey)) {
        return err({ reason: `No book of the day scheduled for ${dateKey}` });
      }

      const [row] = await db
        .update(bookOfTheDay)
        .set({
          instagramImageUrl: entry.imageUrl,
          instagramCaption: entry.caption,
          instagramPreparedAt: now,
          instagramError: null,
          updatedAt: now,
        })
        .where(eq(bookOfTheDay.date, toUtcStartOfDay(entry.date)))
        .returning();

      if (!row) {
        return err({ reason: `Failed to save Instagram prep for ${dateKey}` });
      }
      saved += 1;
    }

    return ok({ saved });
  } catch (e) {
    console.error("saveWeekInstagramPreparation", e);
    return err({ reason: "Failed to save Instagram preparation" });
  }
}

const clearInstagramFields = {
  instagramImageUrl: null,
  instagramCaption: null,
  instagramPreparedAt: null,
  instagramBufferPostId: null,
  instagramQueuedAt: null,
  instagramError: null,
} as const;

export async function clearWeekInstagramPreparation(
  weekStart: Date,
): Promise<Result<{ cleared: number }, { reason: string }>> {
  const normalizedWeekStart = toWeekStart(weekStart);
  const weekEnd = getWeekDays(normalizedWeekStart)[6];

  const [loadError, weekData] = await getBooksOfTheDayInRange(
    normalizedWeekStart,
    weekEnd,
  );
  if (loadError) return err({ reason: loadError.reason });

  const dates = weekData.botdEntries.map((entry) =>
    toUtcStartOfDay(entry.date),
  );
  if (dates.length === 0) {
    return ok({ cleared: 0 });
  }

  const hasInstagramData = weekData.botdEntries.some(
    (entry) =>
      entry.instagramPreparedAt ||
      entry.instagramQueuedAt ||
      entry.instagramCaption ||
      entry.instagramImageUrl ||
      entry.instagramBufferPostId,
  );
  if (!hasInstagramData) {
    return ok({ cleared: 0 });
  }

  try {
    const updated = await db
      .update(bookOfTheDay)
      .set({ ...clearInstagramFields, updatedAt: new Date() })
      .where(inArray(bookOfTheDay.date, dates))
      .returning({ id: bookOfTheDay.id });

    return ok({ cleared: updated.length });
  } catch (e) {
    console.error("clearWeekInstagramPreparation", e);
    return err({ reason: "Failed to clear Instagram preparation" });
  }
}

export async function queuePreparedBotdInstagramForDate(
  date: Date,
): Promise<Result<{ postId: string; botdId: string }, { reason: string }>> {
  const day = toUtcStartOfDay(date);

  const row = await db.query.bookOfTheDay.findFirst({
    where: eq(bookOfTheDay.date, day),
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

  if (!row) return err({ reason: "No book of the day for this date" });
  if (!row.instagramPreparedAt) {
    return err({ reason: "Instagram post is not prepared" });
  }
  if (row.instagramQueuedAt && row.instagramBufferPostId) {
    return err({ reason: "Instagram post already queued in Buffer" });
  }
  if (!row.instagramImageUrl || !row.instagramCaption) {
    return err({ reason: "Instagram image or caption is missing" });
  }

  let dueAt = buildInstagramDueAt(day);
  const now = new Date();
  if (dueAt.getTime() <= now.getTime()) {
    dueAt = new Date(now.getTime() + 5 * 60 * 1000);
  }

  const firstComment = row.book
    ? buildDefaultInstagramFirstComment(row.book)
    : undefined;

  const [bufferError, bufferData] = await bufferCreateScheduledImagePost({
    text: row.instagramCaption,
    imageUrl: row.instagramImageUrl,
    dueAt,
    firstComment,
  });

  if (bufferError) {
    await db
      .update(bookOfTheDay)
      .set({
        instagramError: bufferError.reason,
        updatedAt: new Date(),
      })
      .where(eq(bookOfTheDay.id, row.id));
    return err({ reason: bufferError.reason });
  }

  const [updateError] = await markBotdInstagramQueued(row.id, bufferData.postId);
  if (updateError) return err(updateError);

  return ok({ postId: bufferData.postId, botdId: row.id });
}

async function markBotdInstagramQueued(
  botdId: string,
  postId: string,
): Promise<Result<{ id: string }, { reason: string }>> {
  try {
    const [row] = await db
      .update(bookOfTheDay)
      .set({
        instagramBufferPostId: postId,
        instagramQueuedAt: new Date(),
        instagramError: null,
        updatedAt: new Date(),
      })
      .where(eq(bookOfTheDay.id, botdId))
      .returning({ id: bookOfTheDay.id });

    if (!row) return err({ reason: "Failed to update Instagram queue status" });
    return ok(row);
  } catch (e) {
    console.error("markBotdInstagramQueued", e);
    return err({ reason: "Failed to update Instagram queue status" });
  }
}

type QueueInstagramBatchResult = {
  queued: { date: string; postId: string }[];
  skipped: string[];
};

/** Queue one prepared BOTD Instagram post for a specific UTC calendar day. */
export async function queuePreparedBotdInstagramPostsForDate(
  targetDate: Date,
): Promise<Result<QueueInstagramBatchResult, { reason: string }>> {
  const day = toUtcStartOfDay(targetDate);
  const dateKey = toDateString(day);

  const [error, result] = await queuePreparedBotdInstagramForDate(day);
  if (error) {
    return ok({ queued: [], skipped: [`${dateKey}: ${error.reason}`] });
  }

  return ok({
    queued: [{ date: dateKey, postId: result.postId }],
    skipped: [],
  });
}

/** Queue all prepared, not-yet-queued posts for today (UTC). */
export async function queueDuePreparedBotdInstagramPosts(): Promise<
  Result<QueueInstagramBatchResult, { reason: string }>
> {
  const today = toUtcStartOfDay(new Date());

  const rows = await db.query.bookOfTheDay.findMany({
    where: and(
      eq(bookOfTheDay.date, today),
      isNotNull(bookOfTheDay.instagramPreparedAt),
      isNull(bookOfTheDay.instagramQueuedAt),
    ),
  });

  const queued: { date: string; postId: string }[] = [];
  const skipped: string[] = [];

  for (const row of rows) {
    const [error, result] = await queuePreparedBotdInstagramForDate(row.date);
    if (error) {
      skipped.push(`${toDateString(row.date)}: ${error.reason}`);
      continue;
    }
    queued.push({ date: toDateString(row.date), postId: result.postId });
  }

  return ok({ queued, skipped });
}

export async function getInstagramPreparedByWeekStart(
  year: number,
): Promise<Map<string, boolean>> {
  const weekStarts = getWeekStarts(year);
  if (weekStarts.length === 0) return new Map();

  const first = weekStarts[0];
  const lastWeekStart = weekStarts[weekStarts.length - 1];
  const lastDay = getWeekDays(lastWeekStart)[6];

  const [error, data] = await getBooksOfTheDayInRange(first, lastDay);
  const byDate = new Map<string, { instagramPreparedAt?: Date | null }>();
  if (!error) {
    for (const entry of data.botdEntries) {
      byDate.set(toDateString(entry.date), entry);
    }
  }

  const byWeek = new Map<string, boolean>();
  for (const weekStart of weekStarts) {
    byWeek.set(
      toWeekString(weekStart),
      isWeekInstagramFullyPrepared(weekStart, byDate),
    );
  }
  return byWeek;
}
