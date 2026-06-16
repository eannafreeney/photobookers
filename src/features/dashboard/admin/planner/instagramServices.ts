import {
  and,
  asc,
  eq,
  gte,
  inArray,
  isNotNull,
  lte,
} from "drizzle-orm";
import { db } from "../../../../db/client";
import {
  artistOfTheWeek,
  bookOfTheDay,
  publisherOfTheWeek,
} from "../../../../db/schema";
import { err, ok, type Result } from "../../../../lib/result";
import {
  toDateString,
  toUtcStartOfDay,
  toWeekStart,
  toWeekString,
} from "../../../../lib/utils";
import { getWeekStarts, getWeekDays } from "./utils";
import {
  getBooksOfTheDayInRange,
  type BookOfTheDayWithBook,
} from "../../../app/BOTDServices";
import { linksUrl } from "../../../app/spotlightUrls";
import type {
  ArtistOfTheWeekWithCreator,
  PublisherOfTheWeekWithCreator,
} from "./services";
import {
  bufferCreateScheduledImagePost,
  bufferCreateScheduledStory,
} from "./buffer";
import {
  buildDefaultCreatorInstagramFirstComment,
  buildDefaultInstagramFirstComment,
  buildBotdStoryStickerFields,
  buildStoryStickerText,
  ensureBookTagsInCaption,
} from "./instagramCaption";
import {
  BOOK_CARD_COLUMNS,
  CREATOR_CARD_COLUMNS,
} from "../../../../constants/queries";
import {
  buildAotwInstagramDueAt,
  buildAotwInstagramStoryDueAt,
  buildInstagramDueAt,
  buildInstagramStoryDueAt,
  buildPotwInstagramDueAt,
  buildPotwInstagramStoryDueAt,
  isWeekInstagramFullyPrepared,
  type PrepareInstagramFormPayload,
} from "./instagramUtils";

export type {
  PrepareInstagramEntry,
  PrepareInstagramFormPayload,
  PrepareInstagramSpotlightEntry,
} from "./instagramUtils";
export {
  buildAotwInstagramDueAt,
  buildAotwInstagramStoryDueAt,
  buildInstagramDueAt,
  buildInstagramStoryDueAt,
  buildPotwInstagramDueAt,
  buildPotwInstagramStoryDueAt,
  INSTAGRAM_SPOTLIGHT_AOTW_KEY,
  INSTAGRAM_SPOTLIGHT_POTW_KEY,
  isWeekInstagramFullyPrepared,
  parsePrepareInstagramForm,
  parsePrepareInstagramFormEntries,
} from "./instagramUtils";

const CREATOR_INSTAGRAM_COLUMNS = {
  ...CREATOR_CARD_COLUMNS,
  bio: true,
} as const;

const BOOK_WITH_CREATORS_FOR_INSTAGRAM = {
  columns: BOOK_CARD_COLUMNS,
  with: {
    artist: { columns: CREATOR_CARD_COLUMNS },
    publisher: { columns: CREATOR_CARD_COLUMNS },
  },
} as const;

const clearInstagramFields = {
  instagramImageUrl: null,
  instagramCaption: null,
  instagramPreparedAt: null,
  instagramBufferPostId: null,
  instagramQueuedAt: null,
  instagramError: null,
  instagramStoryBufferPostId: null,
  instagramStoryQueuedAt: null,
  instagramStoryError: null,
} as const;

export type WeekInstagramPrepareData = {
  botdEntries: BookOfTheDayWithBook[];
  artistOfTheWeek: ArtistOfTheWeekWithCreator | null;
  publisherOfTheWeek: PublisherOfTheWeekWithCreator | null;
};

export async function getWeekInstagramForPrepare(
  weekStart: Date,
): Promise<Result<WeekInstagramPrepareData, { reason: string }>> {
  const normalized = toWeekStart(weekStart);
  const weekEnd = getWeekDays(normalized)[6];

  const [botdError, botdData] = await getBooksOfTheDayInRange(
    normalized,
    weekEnd,
  );
  if (botdError) return err({ reason: botdError.reason });

  try {
    const [artistRow, publisherRow] = await Promise.all([
      db.query.artistOfTheWeek.findFirst({
        where: eq(artistOfTheWeek.weekStart, normalized),
        with: { creator: { columns: CREATOR_INSTAGRAM_COLUMNS } },
      }),
      db.query.publisherOfTheWeek.findFirst({
        where: eq(publisherOfTheWeek.weekStart, normalized),
        with: { creator: { columns: CREATOR_INSTAGRAM_COLUMNS } },
      }),
    ]);

    return ok({
      botdEntries: botdData.botdEntries,
      artistOfTheWeek: artistRow ?? null,
      publisherOfTheWeek: publisherRow ?? null,
    });
  } catch (e) {
    console.error("getWeekInstagramForPrepare", e);
    return err({ reason: "Failed to load week Instagram data" });
  }
}

/** @deprecated Use getWeekInstagramForPrepare */
export async function getWeekBotdEntriesForInstagram(weekStart: Date) {
  const [error, data] = await getWeekInstagramForPrepare(weekStart);
  if (error) return err(error);
  return ok({ botdEntries: data.botdEntries });
}

export async function saveWeekInstagramPreparation(
  weekStart: Date,
  payload: PrepareInstagramFormPayload,
): Promise<Result<{ saved: number }, { reason: string }>> {
  const normalizedWeekStart = toWeekStart(weekStart);
  const weekEnd = getWeekDays(normalizedWeekStart)[6];

  const [loadError, weekData] =
    await getWeekInstagramForPrepare(normalizedWeekStart);
  if (loadError) return err({ reason: loadError.reason });

  const allowedDates = new Set(
    weekData.botdEntries.map((entry) => toDateString(entry.date)),
  );

  const now = new Date();
  let saved = 0;

  try {
    for (const entry of payload.botd) {
      const dateKey = toDateString(toUtcStartOfDay(entry.date));
      if (!allowedDates.has(dateKey)) {
        return err({ reason: `No book of the day scheduled for ${dateKey}` });
      }

      const botdRow = weekData.botdEntries.find(
        (row) => toDateString(row.date) === dateKey,
      );
      const caption = botdRow?.book
        ? ensureBookTagsInCaption(entry.caption, botdRow.book.tags)
        : entry.caption;

      const [row] = await db
        .update(bookOfTheDay)
        .set({
          instagramImageUrl: entry.imageUrl,
          instagramCaption: caption,
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

    if (payload.artist) {
      if (!weekData.artistOfTheWeek) {
        return err({ reason: "No artist of the week scheduled for this week" });
      }
      const [row] = await db
        .update(artistOfTheWeek)
        .set({
          instagramImageUrl: payload.artist.imageUrl,
          instagramCaption: payload.artist.caption,
          instagramPreparedAt: now,
          instagramError: null,
          updatedAt: now,
        })
        .where(eq(artistOfTheWeek.weekStart, normalizedWeekStart))
        .returning();
      if (!row) {
        return err({ reason: "Failed to save artist Instagram prep" });
      }
      saved += 1;
    }

    if (payload.publisher) {
      if (!weekData.publisherOfTheWeek) {
        return err({
          reason: "No publisher of the week scheduled for this week",
        });
      }
      const [row] = await db
        .update(publisherOfTheWeek)
        .set({
          instagramImageUrl: payload.publisher.imageUrl,
          instagramCaption: payload.publisher.caption,
          instagramPreparedAt: now,
          instagramError: null,
          updatedAt: now,
        })
        .where(eq(publisherOfTheWeek.weekStart, normalizedWeekStart))
        .returning();
      if (!row) {
        return err({ reason: "Failed to save publisher Instagram prep" });
      }
      saved += 1;
    }

    return ok({ saved });
  } catch (e) {
    console.error("saveWeekInstagramPreparation", e);
    return err({ reason: "Failed to save Instagram preparation" });
  }
}

function hasInstagramPrepData(row: {
  instagramPreparedAt?: Date | null;
  instagramQueuedAt?: Date | null;
  instagramCaption?: string | null;
  instagramImageUrl?: string | null;
  instagramBufferPostId?: string | null;
  instagramStoryQueuedAt?: Date | null;
  instagramStoryBufferPostId?: string | null;
}): boolean {
  return Boolean(
    row.instagramPreparedAt ||
    row.instagramQueuedAt ||
    row.instagramCaption ||
    row.instagramImageUrl ||
    row.instagramBufferPostId ||
    row.instagramStoryQueuedAt ||
    row.instagramStoryBufferPostId,
  );
}

export async function clearWeekInstagramPreparation(
  weekStart: Date,
): Promise<Result<{ cleared: number }, { reason: string }>> {
  const normalizedWeekStart = toWeekStart(weekStart);
  const weekEnd = getWeekDays(normalizedWeekStart)[6];

  const [loadError, weekData] =
    await getWeekInstagramForPrepare(normalizedWeekStart);
  if (loadError) return err({ reason: loadError.reason });

  const dates = weekData.botdEntries.map((entry) =>
    toUtcStartOfDay(entry.date),
  );

  const botdHasData = weekData.botdEntries.some(hasInstagramPrepData);
  const artistHasData =
    weekData.artistOfTheWeek && hasInstagramPrepData(weekData.artistOfTheWeek);
  const publisherHasData =
    weekData.publisherOfTheWeek &&
    hasInstagramPrepData(weekData.publisherOfTheWeek);

  if (!botdHasData && !artistHasData && !publisherHasData) {
    return ok({ cleared: 0 });
  }

  let cleared = 0;

  try {
    if (dates.length > 0 && botdHasData) {
      const updated = await db
        .update(bookOfTheDay)
        .set({ ...clearInstagramFields, updatedAt: new Date() })
        .where(inArray(bookOfTheDay.date, dates))
        .returning({ id: bookOfTheDay.id });
      cleared += updated.length;
    }

    if (artistHasData) {
      const [row] = await db
        .update(artistOfTheWeek)
        .set({ ...clearInstagramFields, updatedAt: new Date() })
        .where(eq(artistOfTheWeek.weekStart, normalizedWeekStart))
        .returning({ id: artistOfTheWeek.id });
      if (row) cleared += 1;
    }

    if (publisherHasData) {
      const [row] = await db
        .update(publisherOfTheWeek)
        .set({ ...clearInstagramFields, updatedAt: new Date() })
        .where(eq(publisherOfTheWeek.weekStart, normalizedWeekStart))
        .returning({ id: publisherOfTheWeek.id });
      if (row) cleared += 1;
    }

    return ok({ cleared });
  } catch (e) {
    console.error("clearWeekInstagramPreparation", e);
    return err({ reason: "Failed to clear Instagram preparation" });
  }
}

function scheduleDueAt(dueAt: Date): Date {
  const now = new Date();
  if (dueAt.getTime() <= now.getTime()) {
    return new Date(now.getTime() + 5 * 60 * 1000);
  }
  return dueAt;
}

function isBufferScheduleLimitError(reason: string): boolean {
  return reason.toLowerCase().includes("scheduled posts limit reached");
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

  const dueAt = scheduleDueAt(buildInstagramDueAt(day));

  const useFirstComment = process.env.BUFFER_INSTAGRAM_FIRST_COMMENT === "true";
  const firstComment =
    useFirstComment && row.book
      ? buildDefaultInstagramFirstComment(row.book)
      : undefined;

  const text = row.book
    ? ensureBookTagsInCaption(row.instagramCaption, row.book.tags)
    : row.instagramCaption;

  const [bufferError, bufferData] = await bufferCreateScheduledImagePost({
    text,
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

  if (text !== row.instagramCaption) {
    await db
      .update(bookOfTheDay)
      .set({ instagramCaption: text, updatedAt: new Date() })
      .where(eq(bookOfTheDay.id, row.id));
  }

  const [updateError] = await markBotdInstagramQueued(
    row.id,
    bufferData.postId,
  );
  if (updateError) return err(updateError);

  return ok({ postId: bufferData.postId, botdId: row.id });
}

export async function queuePreparedBotdInstagramStoryForDate(
  date: Date,
): Promise<Result<{ postId: string; botdId: string }, { reason: string }>> {
  const day = toUtcStartOfDay(date);

  const row = await db.query.bookOfTheDay.findFirst({
    where: eq(bookOfTheDay.date, day),
    with: {
      book: BOOK_WITH_CREATORS_FOR_INSTAGRAM,
    },
  });

  if (!row) return err({ reason: "No book of the day for this date" });
  if (!row.instagramPreparedAt) {
    return err({ reason: "Instagram post is not prepared" });
  }
  if (row.instagramStoryQueuedAt && row.instagramStoryBufferPostId) {
    return err({ reason: "Instagram story already queued in Buffer" });
  }
  if (!row.instagramImageUrl || !row.instagramCaption) {
    return err({ reason: "Instagram image or caption is missing" });
  }

  const dueAt = scheduleDueAt(buildInstagramStoryDueAt(day));

  const baseCaption = row.book
    ? ensureBookTagsInCaption(row.instagramCaption, row.book.tags)
    : row.instagramCaption;

  const [bufferError, bufferData] = await bufferCreateScheduledStory({
    caption: baseCaption,
    imageUrl: row.instagramImageUrl,
    dueAt,
    stickerFields: row.book
      ? buildBotdStoryStickerFields(row.book)
      : { text: baseCaption },
    link: linksUrl(),
  });

  if (bufferError) {
    await db
      .update(bookOfTheDay)
      .set({
        instagramStoryError: bufferError.reason,
        updatedAt: new Date(),
      })
      .where(eq(bookOfTheDay.id, row.id));
    return err({ reason: bufferError.reason });
  }

  const [updateError] = await markBotdInstagramStoryQueued(
    row.id,
    bufferData.postId,
  );
  if (updateError) return err(updateError);

  return ok({ postId: bufferData.postId, botdId: row.id });
}

async function queueSpotlightRow(params: {
  row: {
    id: string;
    instagramPreparedAt: Date | null;
    instagramQueuedAt: Date | null;
    instagramBufferPostId: string | null;
    instagramImageUrl: string | null;
    instagramCaption: string | null;
    creator: { slug: string } | null;
  };
  table: typeof artistOfTheWeek | typeof publisherOfTheWeek;
  dueAt: Date;
}): Promise<Result<{ postId: string; rowId: string }, { reason: string }>> {
  if (!params.row.instagramPreparedAt) {
    return err({ reason: "Instagram post is not prepared" });
  }
  if (params.row.instagramQueuedAt && params.row.instagramBufferPostId) {
    return err({ reason: "Instagram post already queued in Buffer" });
  }
  if (!params.row.instagramImageUrl || !params.row.instagramCaption) {
    return err({ reason: "Instagram image or caption is missing" });
  }

  const dueAt = scheduleDueAt(params.dueAt);
  const useFirstComment = process.env.BUFFER_INSTAGRAM_FIRST_COMMENT === "true";
  const firstComment =
    useFirstComment && params.row.creator
      ? buildDefaultCreatorInstagramFirstComment(params.row.creator)
      : undefined;

  const [bufferError, bufferData] = await bufferCreateScheduledImagePost({
    text: params.row.instagramCaption,
    imageUrl: params.row.instagramImageUrl,
    dueAt,
    firstComment,
  });

  if (bufferError) {
    await db
      .update(params.table)
      .set({
        instagramError: bufferError.reason,
        updatedAt: new Date(),
      })
      .where(eq(params.table.id, params.row.id));
    return err({ reason: bufferError.reason });
  }

  try {
    const [updated] = await db
      .update(params.table)
      .set({
        instagramBufferPostId: bufferData.postId,
        instagramQueuedAt: new Date(),
        instagramError: null,
        updatedAt: new Date(),
      })
      .where(eq(params.table.id, params.row.id))
      .returning({ id: params.table.id });

    if (!updated) {
      return err({ reason: "Failed to update Instagram queue status" });
    }
    return ok({ postId: bufferData.postId, rowId: updated.id });
  } catch (e) {
    console.error("queueSpotlightRow", e);
    return err({ reason: "Failed to update Instagram queue status" });
  }
}

async function queueSpotlightStoryRow(params: {
  row: {
    id: string;
    instagramPreparedAt: Date | null;
    instagramStoryQueuedAt: Date | null;
    instagramStoryBufferPostId: string | null;
    instagramImageUrl: string | null;
    instagramCaption: string | null;
    creator: {
      displayName: string;
      instagram?: string | null;
      type?: string;
    } | null;
  };
  table: typeof artistOfTheWeek | typeof publisherOfTheWeek;
  dueAt: Date;
}): Promise<Result<{ postId: string; rowId: string }, { reason: string }>> {
  if (!params.row.instagramPreparedAt) {
    return err({ reason: "Instagram post is not prepared" });
  }
  if (params.row.instagramStoryQueuedAt && params.row.instagramStoryBufferPostId) {
    return err({ reason: "Instagram story already queued in Buffer" });
  }
  if (!params.row.instagramImageUrl || !params.row.instagramCaption) {
    return err({ reason: "Instagram image or caption is missing" });
  }

  const dueAt = scheduleDueAt(params.dueAt);
  const mentions = params.row.creator
    ? [
        {
          displayName: params.row.creator.displayName,
          instagram: params.row.creator.instagram,
          role: params.row.creator.type,
        },
      ]
    : [];
  const stickerText = buildStoryStickerText(
    params.row.instagramCaption,
    mentions,
  );

  const [bufferError, bufferData] = await bufferCreateScheduledStory({
    caption: params.row.instagramCaption,
    imageUrl: params.row.instagramImageUrl,
    dueAt,
    stickerFields: { text: stickerText },
    link: linksUrl(),
  });

  if (bufferError) {
    await db
      .update(params.table)
      .set({
        instagramStoryError: bufferError.reason,
        updatedAt: new Date(),
      })
      .where(eq(params.table.id, params.row.id));
    return err({ reason: bufferError.reason });
  }

  try {
    const [updated] = await db
      .update(params.table)
      .set({
        instagramStoryBufferPostId: bufferData.postId,
        instagramStoryQueuedAt: new Date(),
        instagramStoryError: null,
        updatedAt: new Date(),
      })
      .where(eq(params.table.id, params.row.id))
      .returning({ id: params.table.id });

    if (!updated) {
      return err({ reason: "Failed to update Instagram story queue status" });
    }
    return ok({ postId: bufferData.postId, rowId: updated.id });
  } catch (e) {
    console.error("queueSpotlightStoryRow", e);
    return err({ reason: "Failed to update Instagram story queue status" });
  }
}

export async function queuePreparedAotwInstagramForWeek(
  weekStart: Date,
): Promise<Result<{ postId: string; rowId: string }, { reason: string }>> {
  const week = toWeekStart(weekStart);
  const row = await db.query.artistOfTheWeek.findFirst({
    where: eq(artistOfTheWeek.weekStart, week),
    with: { creator: { columns: CREATOR_INSTAGRAM_COLUMNS } },
  });
  if (!row) return err({ reason: "No artist of the week for this week" });
  return queueSpotlightRow({
    row,
    table: artistOfTheWeek,
    dueAt: buildAotwInstagramDueAt(weekStart),
  });
}

export async function queuePreparedAotwInstagramStoryForWeek(
  weekStart: Date,
): Promise<Result<{ postId: string; rowId: string }, { reason: string }>> {
  const week = toWeekStart(weekStart);
  const row = await db.query.artistOfTheWeek.findFirst({
    where: eq(artistOfTheWeek.weekStart, week),
    with: { creator: { columns: CREATOR_INSTAGRAM_COLUMNS } },
  });
  if (!row) return err({ reason: "No artist of the week for this week" });
  return queueSpotlightStoryRow({
    row,
    table: artistOfTheWeek,
    dueAt: buildAotwInstagramStoryDueAt(weekStart),
  });
}

export async function queuePreparedPotwInstagramForWeek(
  weekStart: Date,
): Promise<Result<{ postId: string; rowId: string }, { reason: string }>> {
  const week = toWeekStart(weekStart);
  const row = await db.query.publisherOfTheWeek.findFirst({
    where: eq(publisherOfTheWeek.weekStart, week),
    with: { creator: { columns: CREATOR_INSTAGRAM_COLUMNS } },
  });
  if (!row) return err({ reason: "No publisher of the week for this week" });
  return queueSpotlightRow({
    row,
    table: publisherOfTheWeek,
    dueAt: buildPotwInstagramDueAt(weekStart),
  });
}

export async function queuePreparedPotwInstagramStoryForWeek(
  weekStart: Date,
): Promise<Result<{ postId: string; rowId: string }, { reason: string }>> {
  const week = toWeekStart(weekStart);
  const row = await db.query.publisherOfTheWeek.findFirst({
    where: eq(publisherOfTheWeek.weekStart, week),
    with: { creator: { columns: CREATOR_INSTAGRAM_COLUMNS } },
  });
  if (!row) return err({ reason: "No publisher of the week for this week" });
  return queueSpotlightStoryRow({
    row,
    table: publisherOfTheWeek,
    dueAt: buildPotwInstagramStoryDueAt(weekStart),
  });
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

async function markBotdInstagramStoryQueued(
  botdId: string,
  postId: string,
): Promise<Result<{ id: string }, { reason: string }>> {
  try {
    const [row] = await db
      .update(bookOfTheDay)
      .set({
        instagramStoryBufferPostId: postId,
        instagramStoryQueuedAt: new Date(),
        instagramStoryError: null,
        updatedAt: new Date(),
      })
      .where(eq(bookOfTheDay.id, botdId))
      .returning({ id: bookOfTheDay.id });

    if (!row) {
      return err({ reason: "Failed to update Instagram story queue status" });
    }
    return ok(row);
  } catch (e) {
    console.error("markBotdInstagramStoryQueued", e);
    return err({ reason: "Failed to update Instagram story queue status" });
  }
}

type QueueInstagramBatchResult = {
  queued: { key: string; postId: string; kind: "post" | "story" }[];
  skipped: string[];
};

/** Queue prepared BOTD Instagram feed posts and stories for a UTC calendar day. */
export async function queuePreparedBotdInstagramPostsForDate(
  targetDate: Date,
): Promise<Result<QueueInstagramBatchResult, { reason: string }>> {
  const day = toUtcStartOfDay(targetDate);
  const dateKey = toDateString(day);

  const queued: QueueInstagramBatchResult["queued"] = [];
  const skipped: string[] = [];

  const [postError, postResult] = await queuePreparedBotdInstagramForDate(day);
  if (postError) {
    skipped.push(`${dateKey} post: ${postError.reason}`);
  } else {
    queued.push({ key: dateKey, postId: postResult.postId, kind: "post" });
  }

  const [storyError, storyResult] =
    await queuePreparedBotdInstagramStoryForDate(day);
  if (storyError) {
    skipped.push(`${dateKey} story: ${storyError.reason}`);
  } else {
    queued.push({
      key: `${dateKey}-story`,
      postId: storyResult.postId,
      kind: "story",
    });
  }

  const weekStart = toWeekStart(day);
  const saturday = toDateString(getWeekDays(weekStart)[5]);
  const sunday = toDateString(getWeekDays(weekStart)[6]);

  if (dateKey === saturday) {
    const [aotwError, aotw] =
      await queuePreparedAotwInstagramForWeek(weekStart);
    if (aotwError) {
      skipped.push(`aotw post: ${aotwError.reason}`);
    } else {
      queued.push({ key: "aotw", postId: aotw.postId, kind: "post" });
    }

    const [aotwStoryError, aotwStory] =
      await queuePreparedAotwInstagramStoryForWeek(weekStart);
    if (aotwStoryError) {
      skipped.push(`aotw story: ${aotwStoryError.reason}`);
    } else {
      queued.push({
        key: "aotw-story",
        postId: aotwStory.postId,
        kind: "story",
      });
    }
  }

  if (dateKey === sunday) {
    const [potwError, potw] =
      await queuePreparedPotwInstagramForWeek(weekStart);
    if (potwError) {
      skipped.push(`potw post: ${potwError.reason}`);
    } else {
      queued.push({ key: "potw", postId: potw.postId, kind: "post" });
    }

    const [potwStoryError, potwStory] =
      await queuePreparedPotwInstagramStoryForWeek(weekStart);
    if (potwStoryError) {
      skipped.push(`potw story: ${potwStoryError.reason}`);
    } else {
      queued.push({
        key: "potw-story",
        postId: potwStory.postId,
        kind: "story",
      });
    }
  }

  return ok({ queued, skipped });
}

/**
 * Queue every prepared, not-yet-queued Instagram feed post and story from today
 * (UTC) onward: BOTD by date, AOTW on Saturday, POTW on Sunday.
 */
export async function queueDuePreparedInstagramPosts(): Promise<
  Result<QueueInstagramBatchResult, { reason: string }>
> {
  const today = toUtcStartOfDay(new Date());
  const todayKey = toDateString(today);

  const queued: QueueInstagramBatchResult["queued"] = [];
  const skipped: string[] = [];
  let stopDueToBufferLimit = false;

  const botdRows = await db.query.bookOfTheDay.findMany({
    where: and(
      gte(bookOfTheDay.date, today),
      isNotNull(bookOfTheDay.instagramPreparedAt),
    ),
    orderBy: asc(bookOfTheDay.date),
  });

  for (const row of botdRows) {
    if (stopDueToBufferLimit) break;
    const dateKey = toDateString(row.date);
    if (!row.instagramQueuedAt) {
      const [error, result] = await queuePreparedBotdInstagramForDate(row.date);
      if (error) {
        skipped.push(`${dateKey} post: ${error.reason}`);
        if (isBufferScheduleLimitError(error.reason)) {
          stopDueToBufferLimit = true;
          break;
        }
      } else {
        queued.push({ key: dateKey, postId: result.postId, kind: "post" });
      }
    }

    if (!row.instagramStoryQueuedAt) {
      const [error, result] = await queuePreparedBotdInstagramStoryForDate(
        row.date,
      );
      if (error) {
        skipped.push(`${dateKey} story: ${error.reason}`);
        if (isBufferScheduleLimitError(error.reason)) {
          stopDueToBufferLimit = true;
          break;
        }
      } else {
        queued.push({
          key: `${dateKey}-story`,
          postId: result.postId,
          kind: "story",
        });
      }
    }
  }

  const artistRows = await db.query.artistOfTheWeek.findMany({
    where: isNotNull(artistOfTheWeek.instagramPreparedAt),
  });

  for (const row of artistRows) {
    if (stopDueToBufferLimit) break;
    const spotlightDay = toDateString(getWeekDays(row.weekStart)[5]);
    if (spotlightDay < todayKey) continue;
    const weekKey = toWeekString(row.weekStart);

    if (!row.instagramQueuedAt) {
      const [error, result] = await queuePreparedAotwInstagramForWeek(
        row.weekStart,
      );
      if (error) {
        skipped.push(`aotw-${weekKey} post: ${error.reason}`);
        if (isBufferScheduleLimitError(error.reason)) {
          stopDueToBufferLimit = true;
          break;
        }
      } else {
        queued.push({ key: `aotw-${weekKey}`, postId: result.postId, kind: "post" });
      }
    }

    if (!row.instagramStoryQueuedAt) {
      const [error, result] = await queuePreparedAotwInstagramStoryForWeek(
        row.weekStart,
      );
      if (error) {
        skipped.push(`aotw-${weekKey} story: ${error.reason}`);
        if (isBufferScheduleLimitError(error.reason)) {
          stopDueToBufferLimit = true;
          break;
        }
      } else {
        queued.push({
          key: `aotw-${weekKey}-story`,
          postId: result.postId,
          kind: "story",
        });
      }
    }
  }

  const publisherRows = await db.query.publisherOfTheWeek.findMany({
    where: isNotNull(publisherOfTheWeek.instagramPreparedAt),
  });

  for (const row of publisherRows) {
    if (stopDueToBufferLimit) break;
    const spotlightDay = toDateString(getWeekDays(row.weekStart)[6]);
    if (spotlightDay < todayKey) continue;
    const weekKey = toWeekString(row.weekStart);

    if (!row.instagramQueuedAt) {
      const [error, result] = await queuePreparedPotwInstagramForWeek(
        row.weekStart,
      );
      if (error) {
        skipped.push(`potw-${weekKey} post: ${error.reason}`);
        if (isBufferScheduleLimitError(error.reason)) {
          stopDueToBufferLimit = true;
          break;
        }
      } else {
        queued.push({
          key: `potw-${weekKey}`,
          postId: result.postId,
          kind: "post",
        });
      }
    }

    if (!row.instagramStoryQueuedAt) {
      const [error, result] = await queuePreparedPotwInstagramStoryForWeek(
        row.weekStart,
      );
      if (error) {
        skipped.push(`potw-${weekKey} story: ${error.reason}`);
        if (isBufferScheduleLimitError(error.reason)) {
          stopDueToBufferLimit = true;
          break;
        }
      } else {
        queued.push({
          key: `potw-${weekKey}-story`,
          postId: result.postId,
          kind: "story",
        });
      }
    }
  }

  if (stopDueToBufferLimit) {
    skipped.push(
      "Stopped early after Buffer reported scheduled-post limit reached.",
    );
  }

  return ok({ queued, skipped });
}

/** @deprecated Use queueDuePreparedInstagramPosts */
export async function queueDuePreparedBotdInstagramPosts(): Promise<
  Result<
    { queued: { date: string; postId: string }[]; skipped: string[] },
    { reason: string }
  >
> {
  const [error, result] = await queueDuePreparedInstagramPosts();
  if (error) return err(error);
  return ok({
    queued: result.queued.map((q) => ({
      date: q.key,
      postId: q.postId,
    })),
    skipped: result.skipped,
  });
}

export async function getInstagramPreparedByWeekStart(
  year: number,
): Promise<Map<string, boolean>> {
  const weekStarts = getWeekStarts(year);
  if (weekStarts.length === 0) return new Map();

  const first = weekStarts[0];
  const lastWeekStart = weekStarts[weekStarts.length - 1];
  const lastDay = getWeekDays(lastWeekStart)[6];

  const [botdError, botdData] = await getBooksOfTheDayInRange(first, lastDay);
  const byDate = new Map<string, { instagramPreparedAt?: Date | null }>();
  if (!botdError) {
    for (const entry of botdData.botdEntries) {
      byDate.set(toDateString(entry.date), entry);
    }
  }

  const artists = await db.query.artistOfTheWeek.findMany({
    where: and(
      gte(artistOfTheWeek.weekStart, toWeekStart(first)),
      lte(artistOfTheWeek.weekStart, toWeekStart(lastWeekStart)),
    ),
  });
  const artistsByWeek = new Map(
    artists.map((row) => [toWeekString(row.weekStart), row]),
  );

  const publishers = await db.query.publisherOfTheWeek.findMany({
    where: and(
      gte(publisherOfTheWeek.weekStart, toWeekStart(first)),
      lte(publisherOfTheWeek.weekStart, toWeekStart(lastWeekStart)),
    ),
  });
  const publishersByWeek = new Map(
    publishers.map((row) => [toWeekString(row.weekStart), row]),
  );

  const byWeek = new Map<string, boolean>();
  for (const weekStart of weekStarts) {
    const key = toWeekString(weekStart);
    byWeek.set(
      key,
      isWeekInstagramFullyPrepared(weekStart, byDate, {
        artistOfTheWeek: artistsByWeek.get(key) ?? null,
        publisherOfTheWeek: publishersByWeek.get(key) ?? null,
      }),
    );
  }
  return byWeek;
}
