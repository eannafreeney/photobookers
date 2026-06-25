import {
  parseDateString,
  toDateString,
  toUtcStartOfDay,
} from "../../../../lib/utils";
import { err, ok, type Result } from "../../../../lib/result";
import { getWeekDays } from "./utils";

export const INSTAGRAM_SPOTLIGHT_AOTW_KEY = "aotw";
export const INSTAGRAM_SPOTLIGHT_POTW_KEY = "potw";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type PrepareInstagramEntry = {
  date: Date;
  imageUrl: string;
  caption: string;
};

export type PrepareInstagramSpotlightEntry = {
  imageUrl: string;
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

function parseSpotlightEntry(
  key: string,
  captions: Record<string, string>,
  imageUrls: Record<string, string>,
): Result<PrepareInstagramSpotlightEntry | null, { reason: string }> {
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

export function parsePrepareInstagramForm(formData: {
  captions?: Record<string, string>;
  imageUrl?: Record<string, string>;
}): Result<PrepareInstagramFormPayload, { reason: string }> {
  const captions = formData.captions ?? {};
  const imageUrls = formData.imageUrl ?? {};

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
    imageUrls,
  );
  if (artistError) return err(artistError);

  const [publisherError, publisher] = parseSpotlightEntry(
    INSTAGRAM_SPOTLIGHT_POTW_KEY,
    captions,
    imageUrls,
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
  imageUrl?: Record<string, string>;
}): Result<PrepareInstagramEntry[], { reason: string }> {
  const [error, payload] = parsePrepareInstagramForm(formData);
  if (error) return err(error);
  return ok(payload.botd);
}
