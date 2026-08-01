import { eq, inArray } from "drizzle-orm";
import { db } from "../../../../db/client.js";
import {
  artistOfTheWeek,
  bookOfTheDay,
  books,
  publisherOfTheWeek
} from "../../../../db/schema.js";
import { rewriteSpotlightBlurb } from "../../../../lib/openai.js";
import { err, ok } from "../../../../lib/result.js";
import {
  parseDateString,
  toDateString,
  toUtcStartOfDay,
  toWeekStart
} from "../../../../lib/utils.js";
import {
  buildBotdInstagramCaption,
  buildDefaultArtistInstagramCaption,
  buildDefaultPublisherInstagramCaption,
  collectBookImageOptions,
  collectCreatorImageOptions
} from "./social-media/instagramCaption.js";
import { getPlannerInstagramImageSelection } from "./social-media/instagramUtils.js";
function getSpotlightBlurbFieldKey(item) {
  return item.kind === "botd" ? toDateString(item.date) : item.kind === "artist" ? "aotw" : "potw";
}
function findSpotlightBlurbEditorItem(items, key) {
  return items.find((item) => getSpotlightBlurbFieldKey(item) === key) ?? null;
}
async function loadBookDescriptions(entries) {
  const bookIds = entries.map((entry) => entry.book?.id).filter((id) => Boolean(id));
  if (bookIds.length === 0) return /* @__PURE__ */ new Map();
  const rows = await db.query.books.findMany({
    where: inArray(books.id, bookIds),
    columns: { id: true, description: true }
  });
  return new Map(rows.map((row) => [row.id, row.description]));
}
function getCreatorSourceText(creator) {
  const extended = creator;
  return extended.bio?.trim() || extended.tagline?.trim() || null;
}
function weekNeedsSpotlightBlurbs(weekData) {
  for (const entry of weekData.botdEntries) {
    if (!entry.spotlightBlurb?.trim()) return true;
  }
  if (weekData.artistOfTheWeek && !weekData.artistOfTheWeek.spotlightBlurb?.trim()) {
    return true;
  }
  if (weekData.publisherOfTheWeek && !weekData.publisherOfTheWeek.spotlightBlurb?.trim()) {
    return true;
  }
  return false;
}
async function getWeekSpotlightBlurbEditorData(weekData) {
  try {
    const items = [];
    const descriptionsByBookId = await loadBookDescriptions(
      weekData.botdEntries
    );
    for (const entry of weekData.botdEntries) {
      const book = entry.book;
      if (!book) continue;
      const sourceText = descriptionsByBookId.get(book.id)?.trim() || null;
      items.push({
        kind: "botd",
        date: entry.date,
        title: book.title,
        currentBlurb: entry.spotlightBlurb?.trim() || sourceText || "",
        sourceText
      });
    }
    if (weekData.artistOfTheWeek) {
      const sourceText = getCreatorSourceText(weekData.artistOfTheWeek.creator);
      items.push({
        kind: "artist",
        title: weekData.artistOfTheWeek.creator.displayName,
        currentBlurb: weekData.artistOfTheWeek.spotlightBlurb?.trim() || sourceText || "",
        sourceText
      });
    }
    if (weekData.publisherOfTheWeek) {
      const sourceText = getCreatorSourceText(
        weekData.publisherOfTheWeek.creator
      );
      items.push({
        kind: "publisher",
        title: weekData.publisherOfTheWeek.creator.displayName,
        currentBlurb: weekData.publisherOfTheWeek.spotlightBlurb?.trim() || sourceText || "",
        sourceText
      });
    }
    return ok(items);
  } catch (error) {
    console.error("getWeekSpotlightBlurbEditorData", error);
    return err({ reason: "Failed to load spotlight blurbs for this week" });
  }
}
async function generateSpotlightBlurbForKey(weekData, key) {
  try {
    const descriptionsByBookId = await loadBookDescriptions(
      weekData.botdEntries
    );
    if (key === "aotw") {
      const creator = weekData.artistOfTheWeek?.creator;
      if (!creator) return err({ reason: "No artist of the week scheduled" });
      const sourceText2 = getCreatorSourceText(creator);
      if (!sourceText2) {
        return err({
          reason: "No source text available for Artist of the Week"
        });
      }
      const blurb2 = await rewriteSpotlightBlurb({
        kind: "artist",
        sourceText: sourceText2,
        title: creator.displayName
      });
      return ok(blurb2 ?? sourceText2);
    }
    if (key === "potw") {
      const creator = weekData.publisherOfTheWeek?.creator;
      if (!creator)
        return err({ reason: "No publisher of the week scheduled" });
      const sourceText2 = getCreatorSourceText(creator);
      if (!sourceText2) {
        return err({
          reason: "No source text available for Publisher of the Week"
        });
      }
      const blurb2 = await rewriteSpotlightBlurb({
        kind: "publisher",
        sourceText: sourceText2,
        title: creator.displayName
      });
      return ok(blurb2 ?? sourceText2);
    }
    const date = parseDateString(key);
    if (Number.isNaN(date.getTime())) {
      return err({ reason: `Invalid spotlight blurb key: ${key}` });
    }
    const entry = weekData.botdEntries.find(
      (row) => toDateString(row.date) === toDateString(date)
    );
    const book = entry?.book;
    if (!book)
      return err({ reason: `No Book of the Day scheduled for ${key}` });
    const sourceText = descriptionsByBookId.get(book.id)?.trim() || null;
    if (!sourceText) {
      return err({ reason: `No source text available for ${book.title}` });
    }
    const blurb = await rewriteSpotlightBlurb({
      kind: "book",
      sourceText,
      title: book.title
    });
    return ok(blurb ?? sourceText);
  } catch (error) {
    console.error("generateSpotlightBlurbForKey", error);
    return err({ reason: "Failed to generate spotlight blurb" });
  }
}
async function buildWeekSpotlightContent(weekData) {
  try {
    const items = [];
    const descriptionsByBookId = await loadBookDescriptions(
      weekData.botdEntries
    );
    for (const entry of weekData.botdEntries) {
      const book = entry.book;
      if (!book) continue;
      const sourceText = descriptionsByBookId.get(book.id)?.trim() || null;
      const spotlightBlurb = entry.spotlightBlurb?.trim() || (sourceText ? await rewriteSpotlightBlurb({
        kind: "book",
        sourceText,
        title: book.title
      }) : null);
      const imageOptions = collectBookImageOptions(book);
      const featuredImageUrl = entry.featuredImageUrl ?? imageOptions[0] ?? null;
      items.push({
        kind: "botd",
        date: entry.date,
        title: book.title,
        featuredImageUrl,
        instagramImageUrls: getPlannerInstagramImageSelection(
          entry,
          imageOptions
        ),
        sourceText,
        spotlightBlurb,
        instagramCaption: buildBotdInstagramCaption(
          book,
          entry.instagramQueuedAt ? entry.instagramCaption : null,
          spotlightBlurb
        )
      });
    }
    if (weekData.artistOfTheWeek) {
      const creator = weekData.artistOfTheWeek.creator;
      const sourceText = getCreatorSourceText(creator);
      const spotlightBlurb = weekData.artistOfTheWeek.spotlightBlurb?.trim() || (sourceText ? await rewriteSpotlightBlurb({
        kind: "artist",
        sourceText,
        title: creator.displayName
      }) : null);
      const artistImageOptions = collectCreatorImageOptions(
        creator,
        weekData.artistBookCoverUrls
      );
      const featuredImageUrl = weekData.artistOfTheWeek.featuredImageUrl ?? artistImageOptions[0] ?? null;
      items.push({
        kind: "artist",
        title: creator.displayName,
        featuredImageUrl,
        instagramImageUrls: getPlannerInstagramImageSelection(
          weekData.artistOfTheWeek,
          artistImageOptions
        ),
        sourceText,
        spotlightBlurb,
        instagramCaption: weekData.artistOfTheWeek.instagramQueuedAt && weekData.artistOfTheWeek.instagramCaption ? weekData.artistOfTheWeek.instagramCaption : buildDefaultArtistInstagramCaption(creator, spotlightBlurb)
      });
    }
    if (weekData.publisherOfTheWeek) {
      const creator = weekData.publisherOfTheWeek.creator;
      const sourceText = getCreatorSourceText(creator);
      const spotlightBlurb = weekData.publisherOfTheWeek.spotlightBlurb?.trim() || (sourceText ? await rewriteSpotlightBlurb({
        kind: "publisher",
        sourceText,
        title: creator.displayName
      }) : null);
      const publisherImageOptions = collectCreatorImageOptions(
        creator,
        weekData.publisherBookCoverUrls
      );
      const featuredImageUrl = weekData.publisherOfTheWeek.featuredImageUrl ?? publisherImageOptions[0] ?? null;
      items.push({
        kind: "publisher",
        title: creator.displayName,
        featuredImageUrl,
        instagramImageUrls: getPlannerInstagramImageSelection(
          weekData.publisherOfTheWeek,
          publisherImageOptions
        ),
        sourceText,
        spotlightBlurb,
        instagramCaption: weekData.publisherOfTheWeek.instagramQueuedAt && weekData.publisherOfTheWeek.instagramCaption ? weekData.publisherOfTheWeek.instagramCaption : buildDefaultPublisherInstagramCaption(creator, spotlightBlurb)
      });
    }
    return ok(items);
  } catch (error) {
    console.error("buildWeekSpotlightContent", error);
    return err({ reason: "Failed to build week spotlight content" });
  }
}
async function persistWeekSpotlightContent(weekData, items) {
  const normalizedWeekStart = toWeekStart(
    weekData.botdEntries[0]?.date ?? weekData.artistOfTheWeek?.weekStart ?? weekData.publisherOfTheWeek?.weekStart ?? /* @__PURE__ */ new Date()
  );
  const now = /* @__PURE__ */ new Date();
  let saved = 0;
  try {
    for (const item of items) {
      if (item.kind === "botd") {
        const entry = weekData.botdEntries.find(
          (row2) => toDateString(row2.date) === toDateString(item.date)
        );
        if (!entry) continue;
        const updates = {
          spotlightBlurb: item.spotlightBlurb,
          updatedAt: now
        };
        if (!entry.featuredImageUrl && item.featuredImageUrl) {
          updates.featuredImageUrl = item.featuredImageUrl;
        }
        if (!entry.instagramQueuedAt) {
          updates.instagramCaption = item.instagramCaption;
          updates.instagramPreparedAt = now;
        }
        const [row] = await db.update(bookOfTheDay).set(updates).where(eq(bookOfTheDay.date, toUtcStartOfDay(item.date))).returning();
        if (row) saved += 1;
        continue;
      }
      if (item.kind === "artist" && weekData.artistOfTheWeek) {
        const row = weekData.artistOfTheWeek;
        const updates = {
          spotlightBlurb: item.spotlightBlurb,
          updatedAt: now
        };
        if (!row.featuredImageUrl && item.featuredImageUrl) {
          updates.featuredImageUrl = item.featuredImageUrl;
        }
        if (!row.instagramQueuedAt) {
          updates.instagramCaption = item.instagramCaption;
          updates.instagramPreparedAt = now;
        }
        const [updated] = await db.update(artistOfTheWeek).set(updates).where(eq(artistOfTheWeek.weekStart, normalizedWeekStart)).returning();
        if (updated) saved += 1;
        continue;
      }
      if (item.kind === "publisher" && weekData.publisherOfTheWeek) {
        const row = weekData.publisherOfTheWeek;
        const updates = {
          spotlightBlurb: item.spotlightBlurb,
          updatedAt: now
        };
        if (!row.featuredImageUrl && item.featuredImageUrl) {
          updates.featuredImageUrl = item.featuredImageUrl;
        }
        if (!row.instagramQueuedAt) {
          updates.instagramCaption = item.instagramCaption;
          updates.instagramPreparedAt = now;
        }
        const [updated] = await db.update(publisherOfTheWeek).set(updates).where(eq(publisherOfTheWeek.weekStart, normalizedWeekStart)).returning();
        if (updated) saved += 1;
      }
    }
    return ok({ saved });
  } catch (error) {
    console.error("persistWeekSpotlightContent", error);
    return err({ reason: "Failed to persist week spotlight content" });
  }
}
async function saveWeekSpotlightBlurbs(weekStart, blurbs) {
  const normalizedWeekStart = toWeekStart(weekStart);
  let saved = 0;
  const now = /* @__PURE__ */ new Date();
  try {
    for (const [key, rawValue] of Object.entries(blurbs)) {
      const spotlightBlurb = rawValue.trim();
      if (key === "aotw") {
        const [row2] = await db.update(artistOfTheWeek).set({ spotlightBlurb, updatedAt: now }).where(eq(artistOfTheWeek.weekStart, normalizedWeekStart)).returning();
        if (row2) saved += 1;
        continue;
      }
      if (key === "potw") {
        const [row2] = await db.update(publisherOfTheWeek).set({ spotlightBlurb, updatedAt: now }).where(eq(publisherOfTheWeek.weekStart, normalizedWeekStart)).returning();
        if (row2) saved += 1;
        continue;
      }
      const date = parseDateString(key);
      if (Number.isNaN(date.getTime())) {
        return err({ reason: `Invalid spotlight blurb key: ${key}` });
      }
      const [row] = await db.update(bookOfTheDay).set({ spotlightBlurb, updatedAt: now }).where(eq(bookOfTheDay.date, toUtcStartOfDay(date))).returning();
      if (row) saved += 1;
    }
    return ok({ saved });
  } catch (error) {
    console.error("saveWeekSpotlightBlurbs", error);
    return err({ reason: "Failed to save spotlight blurbs" });
  }
}
export {
  buildWeekSpotlightContent,
  findSpotlightBlurbEditorItem,
  generateSpotlightBlurbForKey,
  getSpotlightBlurbFieldKey,
  getWeekSpotlightBlurbEditorData,
  persistWeekSpotlightContent,
  saveWeekSpotlightBlurbs,
  weekNeedsSpotlightBlurbs
};
