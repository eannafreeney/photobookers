import { parseDateString, toDateString, toUtcStartOfDay } from "../../../../lib/utils";
import { err, ok, type Result } from "../../../../lib/result";
import { getWeekDays } from "./utils";
export type PrepareInstagramEntry = {
  date: Date;
  imageUrl: string;
  caption: string;
};

export function buildInstagramDueAt(botdDate: Date): Date {
  const time = process.env.BOTD_INSTAGRAM_POST_TIME ?? "10:00";
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  const hour = match ? Number(match[1]) : 10;
  const minute = match ? Number(match[2]) : 0;
  return new Date(
    Date.UTC(
      botdDate.getUTCFullYear(),
      botdDate.getUTCMonth(),
      botdDate.getUTCDate(),
      hour,
      minute,
    ),
  );
}

export function isWeekInstagramFullyPrepared(
  weekStart: Date,
  botdByDate: Map<
    string,
    { instagramPreparedAt?: Date | null } | null | undefined
  >,
): boolean {
  const days = getWeekDays(weekStart);
  const scheduled = days
    .map((day) => botdByDate.get(toDateString(day)))
    .filter(Boolean);
  if (scheduled.length === 0) return false;
  return scheduled.every((entry) => Boolean(entry?.instagramPreparedAt));
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

  const pattern = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\[(.+)]$`);
  const out: Record<string, string> = {};
  for (const [key, raw] of Object.entries(body)) {
    const match = key.match(pattern);
    if (!match) continue;
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (typeof value === "string") out[match[1]] = value;
  }
  return out;
}

export function parsePrepareInstagramFormEntries(formData: {
  week: string;
  captions?: Record<string, string>;
  imageUrl?: Record<string, string>;
}): Result<PrepareInstagramEntry[], { reason: string }> {
  const captions = formData.captions ?? {};
  const imageUrls = formData.imageUrl ?? {};
  const dates = Object.keys(captions);

  if (dates.length === 0) {
    return err({ reason: "No Instagram posts to save" });
  }

  const entries: PrepareInstagramEntry[] = [];
  for (const dateKey of dates) {
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

    entries.push({ date: toUtcStartOfDay(date), imageUrl, caption });
  }

  return ok(entries);
}
