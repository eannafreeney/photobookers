import {
  parseDateString,
  toDateString,
  toUtcStartOfDay
} from "../../../../../lib/utils.js";
import { err, ok } from "../../../../../lib/result.js";
import { getWeekDays } from "../utils.js";
const INSTAGRAM_SPOTLIGHT_AOTW_KEY = "aotw";
const INSTAGRAM_SPOTLIGHT_POTW_KEY = "potw";
const MAX_INSTAGRAM_CAROUSEL_IMAGES = 3;
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
const VERIFIED_CREATOR_INSTAGRAM_POST_WEEKDAYS_UTC = [2, 4];
function buildVerifiedCreatorInstagramDueAt(from = /* @__PURE__ */ new Date()) {
  const minDueMs = from.getTime() + 24 * 60 * 60 * 1e3;
  const time = process.env.VERIFIED_CREATOR_INSTAGRAM_POST_TIME ?? "14:00";
  const postWeekdays = VERIFIED_CREATOR_INSTAGRAM_POST_WEEKDAYS_UTC;
  let day = toUtcStartOfDay(new Date(minDueMs));
  for (let i = 0; i < 14; i++) {
    if (postWeekdays.includes(day.getUTCDay())) {
      const candidate = buildInstagramDueAtWithTime(day, time);
      if (candidate.getTime() >= minDueMs) return candidate;
    }
    day = new Date(day);
    day.setUTCDate(day.getUTCDate() + 1);
  }
  return buildInstagramDueAtWithTime(day, time);
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
function extractBracketedFormArrayFields(body, prefix) {
  const nested = body[prefix];
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const out2 = {};
    for (const [key, raw] of Object.entries(nested)) {
      const values = normalizeFormStringArray(raw);
      if (values.length > 0) out2[key] = values;
    }
    if (Object.keys(out2).length > 0) return out2;
  }
  const arrayPattern = new RegExp(
    `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\[(.+)]\\[\\]$`
  );
  const scalarPattern = new RegExp(
    `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\[(.+)]$`
  );
  const out = {};
  for (const [key, raw] of Object.entries(body)) {
    const arrayMatch = key.match(arrayPattern);
    if (arrayMatch) {
      const values2 = normalizeFormStringArray(raw);
      if (values2.length > 0) {
        out[arrayMatch[1]] = [...out[arrayMatch[1]] ?? [], ...values2];
      }
      continue;
    }
    const scalarMatch = key.match(scalarPattern);
    if (!scalarMatch) continue;
    const values = normalizeFormStringArray(raw);
    if (values.length > 0) out[scalarMatch[1]] = values;
  }
  for (const [key, values] of Object.entries(out)) {
    out[key] = dedupeImageUrls(values);
  }
  return out;
}
function normalizeFormStringArray(raw) {
  if (Array.isArray(raw)) {
    return raw.map((value) => typeof value === "string" ? value.trim() : "").filter(Boolean);
  }
  if (typeof raw === "string" && raw.trim()) return [raw.trim()];
  return [];
}
function dedupeImageUrls(urls) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const url of urls) {
    const trimmed = url.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}
function resolveInstagramImageUrls(row) {
  const urls = dedupeImageUrls(row.instagramImageUrls ?? []);
  if (urls.length > 0) {
    return urls.slice(0, MAX_INSTAGRAM_CAROUSEL_IMAGES);
  }
  return row.featuredImageUrl ? [row.featuredImageUrl] : [];
}
function getPlannerInstagramImageSelection(row, imageOptions) {
  const saved = resolveInstagramImageUrls(row);
  if (saved.length > 0) return saved;
  return imageOptions[0] ? [imageOptions[0]] : [];
}
function parseImageUrlsForKey(key, imageUrlsByKey) {
  const imageUrls = dedupeImageUrls(imageUrlsByKey[key] ?? []).slice(
    0,
    MAX_INSTAGRAM_CAROUSEL_IMAGES
  );
  if (imageUrls.length === 0) {
    return err({ reason: `At least one image is required for ${key}` });
  }
  return ok(imageUrls);
}
function parseSpotlightEntry(key, captions, imageUrlsByKey) {
  const caption = captions[key]?.trim();
  const imageUrls = imageUrlsByKey[key] ?? [];
  if (!caption && imageUrls.length === 0) return ok(null);
  if (!caption) {
    return err({ reason: `Caption is required for ${key}` });
  }
  const [imageError, parsedImageUrls] = parseImageUrlsForKey(
    key,
    imageUrlsByKey
  );
  if (imageError) return err(imageError);
  return ok({ caption, imageUrls: parsedImageUrls });
}
function parsePrepareInstagramForm(formData) {
  const captions = formData.captions ?? {};
  const imageUrlsByKey = formData.imageUrl ?? {};
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
    if (!caption) {
      return err({ reason: `Caption is required for ${dateKey}` });
    }
    const [imageError, imageUrls] = parseImageUrlsForKey(
      dateKey,
      imageUrlsByKey
    );
    if (imageError) return err(imageError);
    botd.push({ date: toUtcStartOfDay(date), imageUrls, caption });
  }
  const [artistError, artist] = parseSpotlightEntry(
    INSTAGRAM_SPOTLIGHT_AOTW_KEY,
    captions,
    imageUrlsByKey
  );
  if (artistError) return err(artistError);
  const [publisherError, publisher] = parseSpotlightEntry(
    INSTAGRAM_SPOTLIGHT_POTW_KEY,
    captions,
    imageUrlsByKey
  );
  if (publisherError) return err(publisherError);
  if (botd.length === 0 && !artist && !publisher) {
    return err({ reason: "No Instagram posts to save" });
  }
  return ok({ botd, artist, publisher });
}
function parsePrepareInstagramFormEntries(formData) {
  const imageUrl = Object.fromEntries(
    Object.entries(formData.imageUrl ?? {}).map(([key, value]) => [
      key,
      Array.isArray(value) ? value : [value]
    ])
  );
  const [error, payload] = parsePrepareInstagramForm({
    captions: formData.captions,
    imageUrl
  });
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
  MAX_INSTAGRAM_CAROUSEL_IMAGES,
  buildAotwInstagramDueAt,
  buildAotwInstagramStoryDueAt,
  buildInstagramDueAt,
  buildInstagramStoryDueAt,
  buildPotwInstagramDueAt,
  buildPotwInstagramStoryDueAt,
  buildVerifiedCreatorInstagramDueAt,
  dedupeImageUrls,
  extractBracketedFormArrayFields,
  extractBracketedFormFields,
  getPlannerInstagramImageSelection,
  getWeekInstagramPrepGaps,
  isWeekInstagramFullyPrepared,
  parseFeaturedHeroImagesForm,
  parsePrepareInstagramForm,
  parsePrepareInstagramFormEntries,
  resolveInstagramImageUrls,
  scheduleInstagramDueAt
};
