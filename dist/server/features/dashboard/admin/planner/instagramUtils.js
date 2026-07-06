import {
  parseDateString,
  toDateString,
  toUtcStartOfDay
} from "../../../../lib/utils.js";
import { err, ok } from "../../../../lib/result.js";
import { getWeekDays } from "./utils.js";
const INSTAGRAM_SPOTLIGHT_AOTW_KEY = "aotw";
const INSTAGRAM_SPOTLIGHT_POTW_KEY = "potw";
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
function buildInstagramDueAt(botdDate) {
  const time = process.env.BOTD_INSTAGRAM_POST_TIME ?? "10:00";
  return buildInstagramDueAtWithTime(botdDate, time);
}
function buildInstagramStoryDueAt(botdDate) {
  const time = process.env.BOTD_INSTAGRAM_STORY_TIME ?? process.env.BOTD_INSTAGRAM_POST_TIME ?? "10:00";
  return buildInstagramDueAtWithTime(botdDate, time);
}
function buildAotwInstagramDueAt(weekStart) {
  const tuesday = getWeekDays(weekStart)[1];
  const time = process.env.AOTW_INSTAGRAM_POST_TIME ?? "13:00";
  return buildInstagramDueAtWithTime(tuesday, time);
}
function buildAotwInstagramStoryDueAt(weekStart) {
  const saturday = getWeekDays(weekStart)[5];
  const time = process.env.AOTW_INSTAGRAM_STORY_TIME ?? process.env.AOTW_INSTAGRAM_POST_TIME ?? "13:00";
  return buildInstagramDueAtWithTime(saturday, time);
}
function buildPotwInstagramDueAt(weekStart) {
  const monday = getWeekDays(weekStart)[0];
  const time = process.env.POTW_INSTAGRAM_POST_TIME ?? "13:00";
  return buildInstagramDueAtWithTime(monday, time);
}
function buildPotwInstagramStoryDueAt(weekStart) {
  const sunday = getWeekDays(weekStart)[6];
  const time = process.env.POTW_INSTAGRAM_STORY_TIME ?? process.env.POTW_INSTAGRAM_POST_TIME ?? "13:00";
  return buildInstagramDueAtWithTime(sunday, time);
}
function scheduleInstagramDueAt(dueAt) {
  const now = /* @__PURE__ */ new Date();
  if (dueAt.getTime() <= now.getTime()) {
    return new Date(now.getTime() + 5 * 60 * 1e3);
  }
  return dueAt;
}
function buildVerifiedCreatorInstagramDueAt(verifiedAt) {
  const time = process.env.VERIFIED_CREATOR_INSTAGRAM_POST_TIME ?? "14:00";
  return buildInstagramDueAtWithTime(verifiedAt, time);
}
function buildInstagramDueAtWithTime(day, time) {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  const hour = match ? Number(match[1]) : 10;
  const minute = match ? Number(match[2]) : 0;
  return new Date(
    Date.UTC(
      day.getUTCFullYear(),
      day.getUTCMonth(),
      day.getUTCDate(),
      hour,
      minute
    )
  );
}
function getWeekInstagramPrepGaps(weekStart, botdByDate, options) {
  const gaps = [];
  for (const day of getWeekDays(weekStart)) {
    const entry = botdByDate.get(toDateString(day));
    if (entry && !entry.instagramPreparedAt) {
      gaps.push({ kind: "botd", date: day });
    }
  }
  const artist = options?.artistOfTheWeek ?? null;
  if (artist && !artist.instagramPreparedAt) {
    gaps.push({ kind: "artist" });
  }
  const publisher = options?.publisherOfTheWeek ?? null;
  if (publisher && !publisher.instagramPreparedAt) {
    gaps.push({ kind: "publisher" });
  }
  return gaps;
}
function isWeekInstagramFullyPrepared(weekStart, botdByDate, options) {
  const days = getWeekDays(weekStart);
  const scheduledBotd = days.map((day) => botdByDate.get(toDateString(day))).filter(Boolean);
  const artist = options?.artistOfTheWeek ?? null;
  const publisher = options?.publisherOfTheWeek ?? null;
  const hasAnything = scheduledBotd.length > 0 || Boolean(artist) || Boolean(publisher);
  if (!hasAnything) return false;
  const botdReady = scheduledBotd.length === 0 || scheduledBotd.every((entry) => Boolean(entry?.instagramPreparedAt));
  const artistReady = !artist || Boolean(artist.instagramPreparedAt);
  const publisherReady = !publisher || Boolean(publisher.instagramPreparedAt);
  return botdReady && artistReady && publisherReady;
}
function extractBracketedFormFields(body, prefix) {
  const nested = body[prefix];
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const out2 = {};
    for (const [key, raw] of Object.entries(nested)) {
      const value = Array.isArray(raw) ? raw[0] : raw;
      if (typeof value === "string") out2[key] = value;
    }
    if (Object.keys(out2).length > 0) return out2;
  }
  const pattern = new RegExp(
    `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\[(.+)]$`
  );
  const out = {};
  for (const [key, raw] of Object.entries(body)) {
    const match = key.match(pattern);
    if (!match) continue;
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (typeof value === "string") out[match[1]] = value;
  }
  return out;
}
function parseSpotlightEntry(key, captions, imageUrls) {
  const caption = captions[key]?.trim();
  const imageUrl = imageUrls[key]?.trim();
  if (!caption && !imageUrl) return ok(null);
  if (!caption) {
    return err({ reason: `Caption is required for ${key}` });
  }
  if (!imageUrl) {
    return err({ reason: `Image is required for ${key}` });
  }
  return ok({ caption, imageUrl });
}
function parsePrepareInstagramForm(formData) {
  const captions = formData.captions ?? {};
  const imageUrls = formData.imageUrl ?? {};
  if (Object.keys(captions).length === 0) {
    return err({ reason: "No Instagram posts to save" });
  }
  const botd = [];
  for (const dateKey of Object.keys(captions)) {
    if (!DATE_KEY_PATTERN.test(dateKey)) continue;
    const date = parseDateString(dateKey);
    if (Number.isNaN(date.getTime())) {
      return err({ reason: `Invalid date: ${dateKey}` });
    }
    const caption = captions[dateKey]?.trim();
    const imageUrl = imageUrls[dateKey]?.trim();
    if (!caption) {
      return err({ reason: `Caption is required for ${dateKey}` });
    }
    if (!imageUrl) {
      return err({ reason: `Image is required for ${dateKey}` });
    }
    botd.push({ date: toUtcStartOfDay(date), imageUrl, caption });
  }
  const [artistError, artist] = parseSpotlightEntry(
    INSTAGRAM_SPOTLIGHT_AOTW_KEY,
    captions,
    imageUrls
  );
  if (artistError) return err(artistError);
  const [publisherError, publisher] = parseSpotlightEntry(
    INSTAGRAM_SPOTLIGHT_POTW_KEY,
    captions,
    imageUrls
  );
  if (publisherError) return err(publisherError);
  if (botd.length === 0 && !artist && !publisher) {
    return err({ reason: "No Instagram posts to save" });
  }
  return ok({ botd, artist, publisher });
}
function parsePrepareInstagramFormEntries(formData) {
  const [error, payload] = parsePrepareInstagramForm(formData);
  if (error) return err(error);
  return ok(payload.botd);
}
function parseFeaturedHeroImagesForm(formData) {
  const imageUrls = formData.imageUrl ?? {};
  if (Object.keys(imageUrls).length === 0) {
    return err({ reason: "No featured hero images to save" });
  }
  const botd = [];
  for (const dateKey of Object.keys(imageUrls)) {
    if (!DATE_KEY_PATTERN.test(dateKey)) continue;
    const date = parseDateString(dateKey);
    if (Number.isNaN(date.getTime())) {
      return err({ reason: `Invalid date: ${dateKey}` });
    }
    const imageUrl = imageUrls[dateKey]?.trim();
    if (!imageUrl) {
      return err({ reason: `Image is required for ${dateKey}` });
    }
    botd.push({ date: toUtcStartOfDay(date), imageUrl });
  }
  const artistUrl = imageUrls[INSTAGRAM_SPOTLIGHT_AOTW_KEY]?.trim();
  const publisherUrl = imageUrls[INSTAGRAM_SPOTLIGHT_POTW_KEY]?.trim();
  if (botd.length === 0 && !artistUrl && !publisherUrl) {
    return err({ reason: "No featured hero images to save" });
  }
  return ok({
    botd,
    artist: artistUrl ? { imageUrl: artistUrl } : null,
    publisher: publisherUrl ? { imageUrl: publisherUrl } : null
  });
}
export {
  INSTAGRAM_SPOTLIGHT_AOTW_KEY,
  INSTAGRAM_SPOTLIGHT_POTW_KEY,
  buildAotwInstagramDueAt,
  buildAotwInstagramStoryDueAt,
  buildInstagramDueAt,
  buildInstagramStoryDueAt,
  buildPotwInstagramDueAt,
  buildPotwInstagramStoryDueAt,
  buildVerifiedCreatorInstagramDueAt,
  extractBracketedFormFields,
  getWeekInstagramPrepGaps,
  isWeekInstagramFullyPrepared,
  parseFeaturedHeroImagesForm,
  parsePrepareInstagramForm,
  parsePrepareInstagramFormEntries,
  scheduleInstagramDueAt
};
