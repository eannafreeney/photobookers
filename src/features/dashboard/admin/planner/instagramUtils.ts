import {
  parseDateString,
  toDateString,
  toUtcStartOfDay,
} from "../../../../lib/utils";
import { err, ok, type Result } from "../../../../lib/result";
import { getWeekDays } from "./utils";

export const INSTAGRAM_SPOTLIGHT_AOTW_KEY = "aotw";
export const INSTAGRAM_SPOTLIGHT_POTW_KEY = "potw";
export const MAX_INSTAGRAM_CAROUSEL_IMAGES = 3;

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type PrepareInstagramEntry = {
  date: Date;
  imageUrls: string[];
  caption: string;
};

export type PrepareInstagramSpotlightEntry = {
  imageUrls: string[];
  caption: string;
};

export type PrepareInstagramFormPayload = {
  botd: PrepareInstagramEntry[];
  artist: PrepareInstagramSpotlightEntry | null;
  publisher: PrepareInstagramSpotlightEntry | null;
};

export function buildInstagramDueAt(botdDate: Date): Date {
  const time = process.env.BOTD_INSTAGRAM_POST_TIME ?? "10:00";
  return buildInstagramDueAtWithTime(botdDate, time);
}

export function buildInstagramStoryDueAt(botdDate: Date): Date {
  const time =
    process.env.BOTD_INSTAGRAM_STORY_TIME ??
    process.env.BOTD_INSTAGRAM_POST_TIME ??
    "10:00";
  return buildInstagramDueAtWithTime(botdDate, time);
}

/** Tuesday of the ISO week (UTC) for Artist of the Week posts. */
export function buildAotwInstagramDueAt(weekStart: Date): Date {
  const tuesday = getWeekDays(weekStart)[1];
  const time = process.env.AOTW_INSTAGRAM_POST_TIME ?? "13:00";
  return buildInstagramDueAtWithTime(tuesday, time);
}

export function buildAotwInstagramStoryDueAt(weekStart: Date): Date {
  const saturday = getWeekDays(weekStart)[5];
  const time =
    process.env.AOTW_INSTAGRAM_STORY_TIME ??
    process.env.AOTW_INSTAGRAM_POST_TIME ??
    "13:00";
  return buildInstagramDueAtWithTime(saturday, time);
}

/** Wednesday of the ISO week (UTC) for Publisher of the Week posts. */
export function buildPotwInstagramDueAt(weekStart: Date): Date {
  const monday = getWeekDays(weekStart)[0];
  const time = process.env.POTW_INSTAGRAM_POST_TIME ?? "13:00";
  return buildInstagramDueAtWithTime(monday, time);
}

export function buildPotwInstagramStoryDueAt(weekStart: Date): Date {
  const sunday = getWeekDays(weekStart)[6];
  const time =
    process.env.POTW_INSTAGRAM_STORY_TIME ??
    process.env.POTW_INSTAGRAM_POST_TIME ??
    "13:00";
  return buildInstagramDueAtWithTime(sunday, time);
}

/** Bump past-due slots so Buffer accepts them (5 min from now). */
export function scheduleInstagramDueAt(dueAt: Date): Date {
  const now = new Date();
  if (dueAt.getTime() <= now.getTime()) {
    return new Date(now.getTime() + 5 * 60 * 1000);
  }
  return dueAt;
}

/** UTC post time on the creator's verification day. */
export function buildVerifiedCreatorInstagramDueAt(verifiedAt: Date): Date {
  const time = process.env.VERIFIED_CREATOR_INSTAGRAM_POST_TIME ?? "14:00";
  return buildInstagramDueAtWithTime(verifiedAt, time);
}

function buildInstagramDueAtWithTime(day: Date, time: string): Date {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  const hour = match ? Number(match[1]) : 10;
  const minute = match ? Number(match[2]) : 0;
  return new Date(
    Date.UTC(
      day.getUTCFullYear(),
      day.getUTCMonth(),
      day.getUTCDate(),
      hour,
      minute,
    ),
  );
}

type InstagramPreparedRow = {
  instagramPreparedAt?: Date | null;
} | null;

export type InstagramPrepGap =
  | { kind: "botd"; date: Date }
  | { kind: "artist" }
  | { kind: "publisher" };

export function getWeekInstagramPrepGaps(
  weekStart: Date,
  botdByDate: Map<string, InstagramPreparedRow | undefined>,
  options?: {
    artistOfTheWeek?: InstagramPreparedRow;
    publisherOfTheWeek?: InstagramPreparedRow;
  },
): InstagramPrepGap[] {
  const gaps: InstagramPrepGap[] = [];

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

export function isWeekInstagramFullyPrepared(
  weekStart: Date,
  botdByDate: Map<string, InstagramPreparedRow | undefined>,
  options?: {
    artistOfTheWeek?: InstagramPreparedRow;
    publisherOfTheWeek?: InstagramPreparedRow;
  },
): boolean {
  const days = getWeekDays(weekStart);
  const scheduledBotd = days
    .map((day) => botdByDate.get(toDateString(day)))
    .filter(Boolean);

  const artist = options?.artistOfTheWeek ?? null;
  const publisher = options?.publisherOfTheWeek ?? null;

  const hasAnything =
    scheduledBotd.length > 0 || Boolean(artist) || Boolean(publisher);
  if (!hasAnything) return false;

  const botdReady =
    scheduledBotd.length === 0 ||
    scheduledBotd.every((entry) => Boolean(entry?.instagramPreparedAt));

  const artistReady = !artist || Boolean(artist.instagramPreparedAt);
  const publisherReady = !publisher || Boolean(publisher.instagramPreparedAt);

  return botdReady && artistReady && publisherReady;
}

/** Reads `prefix[date]` fields from nested or flat multipart/form bodies. */
export function extractBracketedFormFields(
  body: Record<string, unknown>,
  prefix: string,
): Record<string, string> {
  const nested = body[prefix];
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const out: Record<string, string> = {};
    for (const [key, raw] of Object.entries(nested)) {
      const value = Array.isArray(raw) ? raw[0] : raw;
      if (typeof value === "string") out[key] = value;
    }
    if (Object.keys(out).length > 0) return out;
  }

  const pattern = new RegExp(
    `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\[(.+)]$`,
  );
  const out: Record<string, string> = {};
  for (const [key, raw] of Object.entries(body)) {
    const match = key.match(pattern);
    if (!match) continue;
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (typeof value === "string") out[match[1]] = value;
  }
  return out;
}

/** Reads `prefix[key][]` fields from nested or flat multipart/form bodies. */
export function extractBracketedFormArrayFields(
  body: Record<string, unknown>,
  prefix: string,
): Record<string, string[]> {
  const nested = body[prefix];
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const out: Record<string, string[]> = {};
    for (const [key, raw] of Object.entries(nested)) {
      const values = normalizeFormStringArray(raw);
      if (values.length > 0) out[key] = values;
    }
    if (Object.keys(out).length > 0) return out;
  }

  const arrayPattern = new RegExp(
    `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\[(.+)]\\[\\]$`,
  );
  const scalarPattern = new RegExp(
    `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\[(.+)]$`,
  );
  const out: Record<string, string[]> = {};

  for (const [key, raw] of Object.entries(body)) {
    const arrayMatch = key.match(arrayPattern);
    if (arrayMatch) {
      const values = normalizeFormStringArray(raw);
      if (values.length > 0) {
        out[arrayMatch[1]] = [...(out[arrayMatch[1]] ?? []), ...values];
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

function normalizeFormStringArray(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((value) => (typeof value === "string" ? value.trim() : ""))
      .filter(Boolean);
  }
  if (typeof raw === "string" && raw.trim()) return [raw.trim()];
  return [];
}

export function dedupeImageUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const url of urls) {
    const trimmed = url.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

export function resolveInstagramImageUrls(row: {
  instagramImageUrls?: string[] | null;
  featuredImageUrl?: string | null;
}): string[] {
  const urls = dedupeImageUrls(row.instagramImageUrls ?? []);
  if (urls.length > 0) {
    return urls.slice(0, MAX_INSTAGRAM_CAROUSEL_IMAGES);
  }
  return row.featuredImageUrl ? [row.featuredImageUrl] : [];
}

export function getPlannerInstagramImageSelection(
  row: {
    instagramImageUrls?: string[] | null;
    featuredImageUrl?: string | null;
  },
  imageOptions: string[],
): string[] {
  const saved = resolveInstagramImageUrls(row);
  if (saved.length > 0) return saved;
  return imageOptions[0] ? [imageOptions[0]] : [];
}

function parseImageUrlsForKey(
  key: string,
  imageUrlsByKey: Record<string, string[]>,
): Result<string[], { reason: string }> {
  const imageUrls = dedupeImageUrls(imageUrlsByKey[key] ?? []).slice(
    0,
    MAX_INSTAGRAM_CAROUSEL_IMAGES,
  );
  if (imageUrls.length === 0) {
    return err({ reason: `At least one image is required for ${key}` });
  }
  return ok(imageUrls);
}

function parseSpotlightEntry(
  key: string,
  captions: Record<string, string>,
  imageUrlsByKey: Record<string, string[]>,
): Result<PrepareInstagramSpotlightEntry | null, { reason: string }> {
  const caption = captions[key]?.trim();
  const imageUrls = imageUrlsByKey[key] ?? [];
  if (!caption && imageUrls.length === 0) return ok(null);
  if (!caption) {
    return err({ reason: `Caption is required for ${key}` });
  }
  const [imageError, parsedImageUrls] = parseImageUrlsForKey(key, imageUrlsByKey);
  if (imageError) return err(imageError);
  return ok({ caption, imageUrls: parsedImageUrls });
}

export function parsePrepareInstagramForm(formData: {
  captions?: Record<string, string>;
  imageUrl?: Record<string, string[]>;
}): Result<PrepareInstagramFormPayload, { reason: string }> {
  const captions = formData.captions ?? {};
  const imageUrlsByKey = formData.imageUrl ?? {};

  if (Object.keys(captions).length === 0) {
    return err({ reason: "No Instagram posts to save" });
  }

  const botd: PrepareInstagramEntry[] = [];
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
      imageUrlsByKey,
    );
    if (imageError) return err(imageError);

    botd.push({ date: toUtcStartOfDay(date), imageUrls, caption });
  }

  const [artistError, artist] = parseSpotlightEntry(
    INSTAGRAM_SPOTLIGHT_AOTW_KEY,
    captions,
    imageUrlsByKey,
  );
  if (artistError) return err(artistError);

  const [publisherError, publisher] = parseSpotlightEntry(
    INSTAGRAM_SPOTLIGHT_POTW_KEY,
    captions,
    imageUrlsByKey,
  );
  if (publisherError) return err(publisherError);

  if (botd.length === 0 && !artist && !publisher) {
    return err({ reason: "No Instagram posts to save" });
  }

  return ok({ botd, artist, publisher });
}

/** @deprecated Use parsePrepareInstagramForm */
export function parsePrepareInstagramFormEntries(formData: {
  week: string;
  captions?: Record<string, string>;
  imageUrl?: Record<string, string | string[]>;
}): Result<PrepareInstagramEntry[], { reason: string }> {
  const imageUrl = Object.fromEntries(
    Object.entries(formData.imageUrl ?? {}).map(([key, value]) => [
      key,
      Array.isArray(value) ? value : [value],
    ]),
  );
  const [error, payload] = parsePrepareInstagramForm({
    captions: formData.captions,
    imageUrl,
  });
  if (error) return err(error);
  return ok(payload.botd);
}

export type FeaturedHeroImagesPayload = {
  botd: { date: Date; imageUrl: string }[];
  artist: { imageUrl: string } | null;
  publisher: { imageUrl: string } | null;
};

export function parseFeaturedHeroImagesForm(formData: {
  imageUrl?: Record<string, string>;
}): Result<FeaturedHeroImagesPayload, { reason: string }> {
  const imageUrls = formData.imageUrl ?? {};
  if (Object.keys(imageUrls).length === 0) {
    return err({ reason: "No featured hero images to save" });
  }

  const botd: FeaturedHeroImagesPayload["botd"] = [];
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
    publisher: publisherUrl ? { imageUrl: publisherUrl } : null,
  });
}
