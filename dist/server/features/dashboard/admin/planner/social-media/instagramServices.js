import { and, asc, eq, gte, inArray, isNotNull, lte } from "drizzle-orm";
import { db } from "../../../../../db/client.js";
import {
  artistOfTheWeek,
  bookOfTheDay,
  publisherOfTheWeek
} from "../../../../../db/schema.js";
import { err, ok } from "../../../../../lib/result.js";
import {
  toDateString,
  toUtcStartOfDay,
  toWeekStart,
  toWeekString
} from "../../../../../lib/utils.js";
import {
  renderBotdStoryBlurred,
  renderBotdStoryFullBleed
} from "../../../../../domain/planner/instagramSlides/renderBotdStorySlide.js";
import { uploadImageFromBuffer } from "../../../../../services/storage.js";
import {
  getBooksOfTheDayInRange
} from "../../../../app/BOTDServices.js";
import { getCreatorSpotlightImageUrls } from "../../../../app/services.js";
import { linksUrl } from "../../../../app/spotlightUrls.js";
import { getWeekDays, getWeekStarts } from "../utils.js";
import {
  bufferCreateScheduledStory,
  bufferPostExists
} from "./buffer.js";
import {
  buildArtistInstagramCaption,
  buildBotdInstagramCaption,
  buildBotdStoryStickerFields,
  buildPublisherInstagramCaption,
  buildSpotlightStoryStickerText,
  collectBookImageOptions,
  collectCreatorImageOptions,
  ensureBookTagsInCaption
} from "./instagramCaption.js";
import {
  BOOK_CARD_COLUMNS,
  CREATOR_CARD_COLUMNS
} from "../../../../../constants/queries.js";
import {
  buildAotwInstagramStoryDueAt,
  buildInstagramStoryDueAt,
  buildPotwInstagramStoryDueAt,
  isWeekInstagramFullyPrepared,
  resolveBotdStoryImageUrl,
  resolveSpotlightStoryImageUrl
} from "./instagramUtils.js";
import {
  buildAotwInstagramDueAt as buildAotwInstagramDueAt2,
  buildAotwInstagramStoryDueAt as buildAotwInstagramStoryDueAt2,
  buildInstagramDueAt as buildInstagramDueAt2,
  buildInstagramStoryDueAt as buildInstagramStoryDueAt2,
  buildPotwInstagramDueAt as buildPotwInstagramDueAt2,
  buildPotwInstagramStoryDueAt as buildPotwInstagramStoryDueAt2,
  INSTAGRAM_SPOTLIGHT_AOTW_KEY,
  INSTAGRAM_SPOTLIGHT_POTW_KEY,
  isWeekInstagramFullyPrepared as isWeekInstagramFullyPrepared2,
  parsePrepareInstagramForm,
  parsePrepareInstagramFormEntries,
  parseFeaturedHeroImagesForm,
  extractBracketedFormArrayFields,
  resolveInstagramImageUrls as resolveInstagramImageUrls2
} from "./instagramUtils.js";
const CREATOR_INSTAGRAM_COLUMNS = {
  ...CREATOR_CARD_COLUMNS,
  bio: true
};
const BOOK_WITH_CREATORS_FOR_INSTAGRAM = {
  columns: BOOK_CARD_COLUMNS,
  with: {
    artist: { columns: CREATOR_CARD_COLUMNS },
    publisher: { columns: CREATOR_CARD_COLUMNS }
  }
};
const clearInstagramFields = {
  featuredImageUrl: null,
  instagramImageUrls: null,
  instagramCaption: null,
  instagramPreparedAt: null,
  instagramBufferPostId: null,
  instagramQueuedAt: null,
  instagramError: null,
  instagramStoryBufferPostId: null,
  instagramStoryQueuedAt: null,
  instagramStoryError: null
};
async function uploadBotdStoryImage(buffer, day) {
  const folder = `social/botd/${toDateString(day)}/story`;
  const uploaded = await uploadImageFromBuffer(buffer, folder);
  return ok(uploaded.url);
}
async function uploadSpotlightStoryImage(buffer, kind, dueAt) {
  const folder = `social/${kind === "artist" ? "aotw" : "potw"}/${toDateString(dueAt)}/story`;
  const uploaded = await uploadImageFromBuffer(buffer, folder);
  return ok(uploaded.url);
}
const SPOTLIGHT_IMAGE_BOOK_LIMIT = 12;
async function getWeekInstagramForPrepare(weekStart) {
  const normalized = toWeekStart(weekStart);
  const weekEnd = getWeekDays(normalized)[6];
  const [botdError, botdData] = await getBooksOfTheDayInRange(
    normalized,
    weekEnd
  );
  if (botdError) return err({ reason: botdError.reason });
  try {
    const [artistRow, publisherRow] = await Promise.all([
      db.query.artistOfTheWeek.findFirst({
        where: eq(artistOfTheWeek.weekStart, normalized),
        with: { creator: { columns: CREATOR_INSTAGRAM_COLUMNS } }
      }),
      db.query.publisherOfTheWeek.findFirst({
        where: eq(publisherOfTheWeek.weekStart, normalized),
        with: { creator: { columns: CREATOR_INSTAGRAM_COLUMNS } }
      })
    ]);
    const [artistCoversRes, publisherCoversRes] = await Promise.all([
      artistRow ? getCreatorSpotlightImageUrls(
        "artist",
        artistRow.creatorId,
        SPOTLIGHT_IMAGE_BOOK_LIMIT
      ) : Promise.resolve(ok([])),
      publisherRow ? getCreatorSpotlightImageUrls(
        "publisher",
        publisherRow.creatorId,
        SPOTLIGHT_IMAGE_BOOK_LIMIT
      ) : Promise.resolve(ok([]))
    ]);
    return ok({
      botdEntries: botdData.botdEntries,
      artistOfTheWeek: artistRow ?? null,
      publisherOfTheWeek: publisherRow ?? null,
      artistBookCoverUrls: !artistCoversRes[0] ? artistCoversRes[1] : [],
      publisherBookCoverUrls: !publisherCoversRes[0] ? publisherCoversRes[1] : []
    });
  } catch (e) {
    console.error("getWeekInstagramForPrepare", e);
    return err({ reason: "Failed to load week Instagram data" });
  }
}
async function getWeekBotdEntriesForInstagram(weekStart) {
  const [error, data] = await getWeekInstagramForPrepare(weekStart);
  if (error) return err(error);
  return ok({ botdEntries: data.botdEntries });
}
async function saveWeekInstagramPreparation(weekStart, payload) {
  const normalizedWeekStart = toWeekStart(weekStart);
  const weekEnd = getWeekDays(normalizedWeekStart)[6];
  const [loadError, weekData] = await getWeekInstagramForPrepare(normalizedWeekStart);
  if (loadError) return err({ reason: loadError.reason });
  const allowedDates = new Set(
    weekData.botdEntries.map((entry) => toDateString(entry.date))
  );
  const now = /* @__PURE__ */ new Date();
  let saved = 0;
  try {
    for (const entry of payload.botd) {
      const dateKey = toDateString(toUtcStartOfDay(entry.date));
      if (!allowedDates.has(dateKey)) {
        return err({ reason: `No book of the day scheduled for ${dateKey}` });
      }
      const botdRow = weekData.botdEntries.find(
        (row2) => toDateString(row2.date) === dateKey
      );
      const caption = botdRow?.book ? ensureBookTagsInCaption(entry.caption, botdRow.book.tags) : entry.caption;
      const [row] = await db.update(bookOfTheDay).set({
        featuredImageUrl: entry.imageUrls[0],
        instagramImageUrls: entry.imageUrls,
        instagramCaption: caption,
        instagramPreparedAt: now,
        instagramError: null,
        updatedAt: now
      }).where(eq(bookOfTheDay.date, toUtcStartOfDay(entry.date))).returning();
      if (!row) {
        return err({ reason: `Failed to save Instagram prep for ${dateKey}` });
      }
      saved += 1;
    }
    if (payload.artist) {
      if (!weekData.artistOfTheWeek) {
        return err({ reason: "No artist of the week scheduled for this week" });
      }
      const [row] = await db.update(artistOfTheWeek).set({
        featuredImageUrl: payload.artist.imageUrls[0],
        instagramImageUrls: payload.artist.imageUrls,
        instagramCaption: payload.artist.caption,
        instagramPreparedAt: now,
        instagramError: null,
        updatedAt: now
      }).where(eq(artistOfTheWeek.weekStart, normalizedWeekStart)).returning();
      if (!row) {
        return err({ reason: "Failed to save artist Instagram prep" });
      }
      saved += 1;
    }
    if (payload.publisher) {
      if (!weekData.publisherOfTheWeek) {
        return err({
          reason: "No publisher of the week scheduled for this week"
        });
      }
      const [row] = await db.update(publisherOfTheWeek).set({
        featuredImageUrl: payload.publisher.imageUrls[0],
        instagramImageUrls: payload.publisher.imageUrls,
        instagramCaption: payload.publisher.caption,
        instagramPreparedAt: now,
        instagramError: null,
        updatedAt: now
      }).where(eq(publisherOfTheWeek.weekStart, normalizedWeekStart)).returning();
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
async function saveWeekFeaturedHeroImages(weekStart, payload) {
  const normalizedWeekStart = toWeekStart(weekStart);
  const [loadError, weekData] = await getWeekInstagramForPrepare(normalizedWeekStart);
  if (loadError) return err({ reason: loadError.reason });
  const allowedDates = new Set(
    weekData.botdEntries.map((entry) => toDateString(entry.date))
  );
  const now = /* @__PURE__ */ new Date();
  let saved = 0;
  try {
    for (const entry of payload.botd) {
      const dateKey = toDateString(toUtcStartOfDay(entry.date));
      if (!allowedDates.has(dateKey)) {
        return err({ reason: `No book of the day scheduled for ${dateKey}` });
      }
      const [row] = await db.update(bookOfTheDay).set({
        featuredImageUrl: entry.imageUrl,
        updatedAt: now
      }).where(eq(bookOfTheDay.date, toUtcStartOfDay(entry.date))).returning();
      if (!row) {
        return err({
          reason: `Failed to save featured hero image for ${dateKey}`
        });
      }
      saved += 1;
    }
    if (payload.artist) {
      if (!weekData.artistOfTheWeek) {
        return err({ reason: "No artist of the week scheduled for this week" });
      }
      const [row] = await db.update(artistOfTheWeek).set({
        featuredImageUrl: payload.artist.imageUrl,
        updatedAt: now
      }).where(eq(artistOfTheWeek.weekStart, normalizedWeekStart)).returning();
      if (!row) {
        return err({ reason: "Failed to save artist featured hero image" });
      }
      saved += 1;
    }
    if (payload.publisher) {
      if (!weekData.publisherOfTheWeek) {
        return err({
          reason: "No publisher of the week scheduled for this week"
        });
      }
      const [row] = await db.update(publisherOfTheWeek).set({
        featuredImageUrl: payload.publisher.imageUrl,
        updatedAt: now
      }).where(eq(publisherOfTheWeek.weekStart, normalizedWeekStart)).returning();
      if (!row) {
        return err({ reason: "Failed to save publisher featured hero image" });
      }
      saved += 1;
    }
    return ok({ saved });
  } catch (e) {
    console.error("saveWeekFeaturedHeroImages", e);
    return err({ reason: "Failed to save featured hero images" });
  }
}
async function ensureWeekFeaturedImages(weekStart) {
  const normalizedWeekStart = toWeekStart(weekStart);
  const [loadError, weekData] = await getWeekInstagramForPrepare(normalizedWeekStart);
  if (loadError) return err({ reason: loadError.reason });
  const now = /* @__PURE__ */ new Date();
  let saved = 0;
  try {
    for (const entry of weekData.botdEntries) {
      if (entry.featuredImageUrl || !entry.book) continue;
      const imageUrl = collectBookImageOptions(entry.book)[0];
      if (!imageUrl) continue;
      const [row] = await db.update(bookOfTheDay).set({ featuredImageUrl: imageUrl, updatedAt: now }).where(eq(bookOfTheDay.date, toUtcStartOfDay(entry.date))).returning();
      if (row) saved += 1;
    }
    if (weekData.artistOfTheWeek && !weekData.artistOfTheWeek.featuredImageUrl) {
      const imageUrl = collectCreatorImageOptions(
        weekData.artistOfTheWeek.creator,
        weekData.artistBookCoverUrls
      )[0];
      if (imageUrl) {
        const [row] = await db.update(artistOfTheWeek).set({ featuredImageUrl: imageUrl, updatedAt: now }).where(eq(artistOfTheWeek.weekStart, normalizedWeekStart)).returning();
        if (row) saved += 1;
      }
    }
    if (weekData.publisherOfTheWeek && !weekData.publisherOfTheWeek.featuredImageUrl) {
      const imageUrl = collectCreatorImageOptions(
        weekData.publisherOfTheWeek.creator,
        weekData.publisherBookCoverUrls
      )[0];
      if (imageUrl) {
        const [row] = await db.update(publisherOfTheWeek).set({ featuredImageUrl: imageUrl, updatedAt: now }).where(eq(publisherOfTheWeek.weekStart, normalizedWeekStart)).returning();
        if (row) saved += 1;
      }
    }
    return ok({ saved });
  } catch (e) {
    console.error("ensureWeekFeaturedImages", e);
    return err({ reason: "Failed to set default featured images" });
  }
}
function hasInstagramPrepData(row) {
  return Boolean(
    row.instagramPreparedAt || row.instagramQueuedAt || row.instagramCaption || row.featuredImageUrl || row.instagramImageUrls?.length || row.instagramBufferPostId || row.instagramStoryQueuedAt || row.instagramStoryBufferPostId
  );
}
async function clearWeekInstagramPreparation(weekStart) {
  const normalizedWeekStart = toWeekStart(weekStart);
  const weekEnd = getWeekDays(normalizedWeekStart)[6];
  const [loadError, weekData] = await getWeekInstagramForPrepare(normalizedWeekStart);
  if (loadError) return err({ reason: loadError.reason });
  const dates = weekData.botdEntries.map(
    (entry) => toUtcStartOfDay(entry.date)
  );
  const botdHasData = weekData.botdEntries.some(hasInstagramPrepData);
  const artistHasData = weekData.artistOfTheWeek && hasInstagramPrepData(weekData.artistOfTheWeek);
  const publisherHasData = weekData.publisherOfTheWeek && hasInstagramPrepData(weekData.publisherOfTheWeek);
  if (!botdHasData && !artistHasData && !publisherHasData) {
    return ok({ cleared: 0 });
  }
  let cleared = 0;
  try {
    if (dates.length > 0 && botdHasData) {
      const updated = await db.update(bookOfTheDay).set({ ...clearInstagramFields, updatedAt: /* @__PURE__ */ new Date() }).where(inArray(bookOfTheDay.date, dates)).returning({ id: bookOfTheDay.id });
      cleared += updated.length;
    }
    if (artistHasData) {
      const [row] = await db.update(artistOfTheWeek).set({ ...clearInstagramFields, updatedAt: /* @__PURE__ */ new Date() }).where(eq(artistOfTheWeek.weekStart, normalizedWeekStart)).returning({ id: artistOfTheWeek.id });
      if (row) cleared += 1;
    }
    if (publisherHasData) {
      const [row] = await db.update(publisherOfTheWeek).set({ ...clearInstagramFields, updatedAt: /* @__PURE__ */ new Date() }).where(eq(publisherOfTheWeek.weekStart, normalizedWeekStart)).returning({ id: publisherOfTheWeek.id });
      if (row) cleared += 1;
    }
    return ok({ cleared });
  } catch (e) {
    console.error("clearWeekInstagramPreparation", e);
    return err({ reason: "Failed to clear Instagram preparation" });
  }
}
function scheduleDueAt(dueAt) {
  const now = /* @__PURE__ */ new Date();
  if (dueAt.getTime() <= now.getTime()) {
    return new Date(now.getTime() + 5 * 60 * 1e3);
  }
  return dueAt;
}
const clearStoryQueueFields = {
  instagramStoryBufferPostId: null,
  instagramStoryQueuedAt: null,
  instagramStoryError: null
};
async function resolveQueuedInstagramPost(postId) {
  const [error, exists] = await bufferPostExists(postId);
  if (error) return "unknown";
  return exists ? "skip" : "requeue";
}
function isBufferScheduleLimitError(reason) {
  return reason.toLowerCase().includes("scheduled posts limit reached");
}
async function queuePreparedBotdInstagramStoryForDate(date) {
  const day = toUtcStartOfDay(date);
  const row = await db.query.bookOfTheDay.findFirst({
    where: eq(bookOfTheDay.date, day),
    with: {
      book: BOOK_WITH_CREATORS_FOR_INSTAGRAM
    }
  });
  if (!row) return err({ reason: "No book of the day for this date" });
  if (!row.instagramPreparedAt) {
    return err({ reason: "Instagram post is not prepared" });
  }
  if (row.instagramStoryQueuedAt && row.instagramStoryBufferPostId) {
    const action = await resolveQueuedInstagramPost(
      row.instagramStoryBufferPostId
    );
    if (action === "skip" || action === "unknown") {
      return err({ reason: "Instagram story already queued in Buffer" });
    }
    await db.update(bookOfTheDay).set({ ...clearStoryQueueFields, updatedAt: /* @__PURE__ */ new Date() }).where(eq(bookOfTheDay.id, row.id));
  }
  if (!row.instagramCaption) {
    return err({ reason: "Instagram image or caption is missing" });
  }
  const storySourceUrl = resolveBotdStoryImageUrl(row);
  if (!storySourceUrl) {
    return err({ reason: "Instagram image or caption is missing" });
  }
  const renderedStory = row.artistProvidedStoryImageUrl ? await renderBotdStoryFullBleed(storySourceUrl, {
    title: row.book?.title ?? "Book of the Day",
    artistName: row.book?.artist?.displayName ?? null,
    publisherName: row.book?.publisher?.displayName ?? null
  }) : await renderBotdStoryBlurred(storySourceUrl, {
    title: row.book?.title ?? "Book of the Day",
    artistName: row.book?.artist?.displayName ?? null,
    publisherName: row.book?.publisher?.displayName ?? null
  });
  const [uploadError, storyImageUrl] = await uploadBotdStoryImage(
    renderedStory,
    day
  );
  if (uploadError) return err(uploadError);
  const dueAt = scheduleDueAt(buildInstagramStoryDueAt(day));
  const baseCaption = row.book ? ensureBookTagsInCaption(
    buildBotdInstagramCaption(
      row.book,
      row.instagramCaption,
      row.spotlightBlurb
    ),
    row.book.tags
  ) : row.instagramCaption;
  const [bufferError, bufferData] = await bufferCreateScheduledStory({
    caption: baseCaption,
    imageUrl: storyImageUrl,
    dueAt,
    stickerFields: row.book ? buildBotdStoryStickerFields(row.book) : { text: baseCaption },
    link: linksUrl()
  });
  if (bufferError) {
    await db.update(bookOfTheDay).set({
      instagramStoryError: bufferError.reason,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(bookOfTheDay.id, row.id));
    return err({ reason: bufferError.reason });
  }
  const [updateError] = await markBotdInstagramStoryQueued(
    row.id,
    bufferData.postId
  );
  if (updateError) return err(updateError);
  return ok({ postId: bufferData.postId, botdId: row.id });
}
async function queueSpotlightStoryRow(params) {
  if (!params.row.instagramPreparedAt) {
    return err({ reason: "Instagram post is not prepared" });
  }
  if (params.row.instagramStoryQueuedAt && params.row.instagramStoryBufferPostId) {
    const action = await resolveQueuedInstagramPost(
      params.row.instagramStoryBufferPostId
    );
    if (action === "skip" || action === "unknown") {
      return err({ reason: "Instagram story already queued in Buffer" });
    }
    await db.update(params.table).set({ ...clearStoryQueueFields, updatedAt: /* @__PURE__ */ new Date() }).where(eq(params.table.id, params.row.id));
  }
  if (!params.row.instagramCaption) {
    return err({ reason: "Instagram image or caption is missing" });
  }
  const storySourceUrl = resolveSpotlightStoryImageUrl(params.row);
  if (!storySourceUrl) {
    return err({ reason: "Instagram image or caption is missing" });
  }
  const label = params.kind === "artist" ? "ARTIST OF THE WEEK" : "PUBLISHER OF THE WEEK";
  const renderedStory = params.row.artistProvidedStoryImageUrl ? await renderBotdStoryFullBleed(storySourceUrl, {
    title: params.row.creator?.displayName ?? label,
    artistName: null,
    label
  }) : await renderBotdStoryBlurred(storySourceUrl, {
    title: params.row.creator?.displayName ?? label,
    artistName: null,
    label
  });
  const [uploadError, storyImageUrl] = await uploadSpotlightStoryImage(
    renderedStory,
    params.kind,
    params.dueAt
  );
  if (uploadError) return err(uploadError);
  const caption = params.row.creator == null ? params.row.instagramCaption : params.kind === "artist" ? buildArtistInstagramCaption(
    params.row.creator,
    params.row.instagramCaption,
    params.row.spotlightBlurb
  ) : buildPublisherInstagramCaption(
    params.row.creator,
    params.row.instagramCaption,
    params.row.spotlightBlurb
  );
  const dueAt = scheduleDueAt(params.dueAt);
  const mentions = params.row.creator ? [
    {
      displayName: params.row.creator.displayName,
      instagram: params.row.creator.instagram,
      role: params.row.creator.type
    }
  ] : [];
  const stickerText = buildSpotlightStoryStickerText(caption, mentions);
  const [bufferError, bufferData] = await bufferCreateScheduledStory({
    caption,
    imageUrl: storyImageUrl,
    dueAt,
    stickerFields: { text: stickerText },
    link: linksUrl()
  });
  if (bufferError) {
    await db.update(params.table).set({
      instagramStoryError: bufferError.reason,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(params.table.id, params.row.id));
    return err({ reason: bufferError.reason });
  }
  if (caption !== params.row.instagramCaption) {
    await db.update(params.table).set({ instagramCaption: caption, updatedAt: /* @__PURE__ */ new Date() }).where(eq(params.table.id, params.row.id));
  }
  try {
    const [updated] = await db.update(params.table).set({
      instagramStoryBufferPostId: bufferData.postId,
      instagramStoryQueuedAt: /* @__PURE__ */ new Date(),
      instagramStoryError: null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(params.table.id, params.row.id)).returning({ id: params.table.id });
    if (!updated) {
      return err({ reason: "Failed to update Instagram story queue status" });
    }
    return ok({ postId: bufferData.postId, rowId: updated.id });
  } catch (e) {
    console.error("queueSpotlightStoryRow", e);
    return err({ reason: "Failed to update Instagram story queue status" });
  }
}
async function queuePreparedAotwInstagramStoryForWeek(weekStart) {
  const week = toWeekStart(weekStart);
  const row = await db.query.artistOfTheWeek.findFirst({
    where: eq(artistOfTheWeek.weekStart, week),
    with: { creator: { columns: CREATOR_INSTAGRAM_COLUMNS } }
  });
  if (!row) return err({ reason: "No artist of the week for this week" });
  return queueSpotlightStoryRow({
    kind: "artist",
    row,
    table: artistOfTheWeek,
    dueAt: buildAotwInstagramStoryDueAt(weekStart)
  });
}
async function queuePreparedPotwInstagramStoryForWeek(weekStart) {
  const week = toWeekStart(weekStart);
  const row = await db.query.publisherOfTheWeek.findFirst({
    where: eq(publisherOfTheWeek.weekStart, week),
    with: { creator: { columns: CREATOR_INSTAGRAM_COLUMNS } }
  });
  if (!row) return err({ reason: "No publisher of the week for this week" });
  return queueSpotlightStoryRow({
    kind: "publisher",
    row,
    table: publisherOfTheWeek,
    dueAt: buildPotwInstagramStoryDueAt(weekStart)
  });
}
async function markBotdInstagramStoryQueued(botdId, postId) {
  try {
    const [row] = await db.update(bookOfTheDay).set({
      instagramStoryBufferPostId: postId,
      instagramStoryQueuedAt: /* @__PURE__ */ new Date(),
      instagramStoryError: null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(bookOfTheDay.id, botdId)).returning({ id: bookOfTheDay.id });
    if (!row) {
      return err({ reason: "Failed to update Instagram story queue status" });
    }
    return ok(row);
  } catch (e) {
    console.error("markBotdInstagramStoryQueued", e);
    return err({ reason: "Failed to update Instagram story queue status" });
  }
}
async function queuePreparedBotdInstagramPostsForDate(targetDate) {
  const day = toUtcStartOfDay(targetDate);
  const dateKey = toDateString(day);
  const queued = [];
  const skipped = [];
  const [storyError, storyResult] = await queuePreparedBotdInstagramStoryForDate(day);
  if (storyError) {
    skipped.push(`${dateKey} story: ${storyError.reason}`);
  } else {
    queued.push({
      key: `${dateKey}-story`,
      postId: storyResult.postId,
      kind: "story"
    });
  }
  const weekStart = toWeekStart(day);
  const saturday = toDateString(getWeekDays(weekStart)[5]);
  const sunday = toDateString(getWeekDays(weekStart)[6]);
  if (dateKey === saturday) {
    const [aotwStoryError, aotwStory] = await queuePreparedAotwInstagramStoryForWeek(weekStart);
    if (aotwStoryError) {
      skipped.push(`aotw story: ${aotwStoryError.reason}`);
    } else {
      queued.push({
        key: "aotw-story",
        postId: aotwStory.postId,
        kind: "story"
      });
    }
  }
  if (dateKey === sunday) {
    const [potwStoryError, potwStory] = await queuePreparedPotwInstagramStoryForWeek(weekStart);
    if (potwStoryError) {
      skipped.push(`potw story: ${potwStoryError.reason}`);
    } else {
      queued.push({
        key: "potw-story",
        postId: potwStory.postId,
        kind: "story"
      });
    }
  }
  return ok({ queued, skipped });
}
async function queueDuePreparedInstagramPosts() {
  const today = toUtcStartOfDay(/* @__PURE__ */ new Date());
  const todayKey = toDateString(today);
  const queued = [];
  const skipped = [];
  let stopDueToBufferLimit = false;
  const botdRows = await db.query.bookOfTheDay.findMany({
    where: and(
      gte(bookOfTheDay.date, today),
      isNotNull(bookOfTheDay.instagramPreparedAt)
    ),
    orderBy: asc(bookOfTheDay.date)
  });
  for (const row of botdRows) {
    if (stopDueToBufferLimit) break;
    const dateKey = toDateString(row.date);
    if (!row.instagramStoryQueuedAt) {
      const [error, result] = await queuePreparedBotdInstagramStoryForDate(
        row.date
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
          kind: "story"
        });
      }
    }
  }
  const artistRows = await db.query.artistOfTheWeek.findMany({
    where: isNotNull(artistOfTheWeek.instagramPreparedAt)
  });
  for (const row of artistRows) {
    if (stopDueToBufferLimit) break;
    const spotlightDay = toDateString(getWeekDays(row.weekStart)[5]);
    if (spotlightDay < todayKey) continue;
    const weekKey = toWeekString(row.weekStart);
    if (!row.instagramStoryQueuedAt) {
      const [error, result] = await queuePreparedAotwInstagramStoryForWeek(
        row.weekStart
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
          kind: "story"
        });
      }
    }
  }
  const publisherRows = await db.query.publisherOfTheWeek.findMany({
    where: isNotNull(publisherOfTheWeek.instagramPreparedAt)
  });
  for (const row of publisherRows) {
    if (stopDueToBufferLimit) break;
    const spotlightDay = toDateString(getWeekDays(row.weekStart)[6]);
    if (spotlightDay < todayKey) continue;
    const weekKey = toWeekString(row.weekStart);
    if (!row.instagramStoryQueuedAt) {
      const [error, result] = await queuePreparedPotwInstagramStoryForWeek(
        row.weekStart
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
          kind: "story"
        });
      }
    }
  }
  if (stopDueToBufferLimit) {
    skipped.push(
      "Stopped early after Buffer reported scheduled-post limit reached."
    );
  }
  return ok({ queued, skipped });
}
async function queueDuePreparedBotdInstagramPosts() {
  const [error, result] = await queueDuePreparedInstagramPosts();
  if (error) return err(error);
  return ok({
    queued: result.queued.map((q) => ({
      date: q.key,
      postId: q.postId
    })),
    skipped: result.skipped
  });
}
async function getInstagramPreparedByWeekStart(year) {
  const weekStarts = getWeekStarts(year);
  if (weekStarts.length === 0) return /* @__PURE__ */ new Map();
  const first = weekStarts[0];
  const lastWeekStart = weekStarts[weekStarts.length - 1];
  const lastDay = getWeekDays(lastWeekStart)[6];
  const [botdError, botdData] = await getBooksOfTheDayInRange(first, lastDay);
  const byDate = /* @__PURE__ */ new Map();
  if (!botdError) {
    for (const entry of botdData.botdEntries) {
      byDate.set(toDateString(entry.date), entry);
    }
  }
  const artists = await db.query.artistOfTheWeek.findMany({
    where: and(
      gte(artistOfTheWeek.weekStart, toWeekStart(first)),
      lte(artistOfTheWeek.weekStart, toWeekStart(lastWeekStart))
    )
  });
  const artistsByWeek = new Map(
    artists.map((row) => [toWeekString(row.weekStart), row])
  );
  const publishers = await db.query.publisherOfTheWeek.findMany({
    where: and(
      gte(publisherOfTheWeek.weekStart, toWeekStart(first)),
      lte(publisherOfTheWeek.weekStart, toWeekStart(lastWeekStart))
    )
  });
  const publishersByWeek = new Map(
    publishers.map((row) => [toWeekString(row.weekStart), row])
  );
  const byWeek = /* @__PURE__ */ new Map();
  for (const weekStart of weekStarts) {
    const key = toWeekString(weekStart);
    byWeek.set(
      key,
      isWeekInstagramFullyPrepared(weekStart, byDate, {
        artistOfTheWeek: artistsByWeek.get(key) ?? null,
        publisherOfTheWeek: publishersByWeek.get(key) ?? null
      })
    );
  }
  return byWeek;
}
export {
  INSTAGRAM_SPOTLIGHT_AOTW_KEY,
  INSTAGRAM_SPOTLIGHT_POTW_KEY,
  buildAotwInstagramDueAt2 as buildAotwInstagramDueAt,
  buildAotwInstagramStoryDueAt2 as buildAotwInstagramStoryDueAt,
  buildInstagramDueAt2 as buildInstagramDueAt,
  buildInstagramStoryDueAt2 as buildInstagramStoryDueAt,
  buildPotwInstagramDueAt2 as buildPotwInstagramDueAt,
  buildPotwInstagramStoryDueAt2 as buildPotwInstagramStoryDueAt,
  clearWeekInstagramPreparation,
  ensureWeekFeaturedImages,
  extractBracketedFormArrayFields,
  getInstagramPreparedByWeekStart,
  getWeekBotdEntriesForInstagram,
  getWeekInstagramForPrepare,
  isWeekInstagramFullyPrepared2 as isWeekInstagramFullyPrepared,
  parseFeaturedHeroImagesForm,
  parsePrepareInstagramForm,
  parsePrepareInstagramFormEntries,
  queueDuePreparedBotdInstagramPosts,
  queueDuePreparedInstagramPosts,
  queuePreparedAotwInstagramStoryForWeek,
  queuePreparedBotdInstagramPostsForDate,
  queuePreparedBotdInstagramStoryForDate,
  queuePreparedPotwInstagramStoryForWeek,
  resolveInstagramImageUrls2 as resolveInstagramImageUrls,
  saveWeekFeaturedHeroImages,
  saveWeekInstagramPreparation
};
