import { and, eq, isNotNull, lt } from "drizzle-orm";
import { db } from "../../../db/client";
import {
  artistOfTheWeek,
  bookOfTheDay,
  publisherOfTheWeek,
} from "../../../db/schema";
import { deleteImage } from "../../../services/storage";
import { ok, type Result } from "../../../lib/result";
import { toUtcStartOfDay } from "../../../lib/utils";

const CLEANUP_AGE_DAYS = 7;

function pathFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/^\/+/, "");
  } catch {
    return null;
  }
}

async function deleteRowImage(
  table: typeof bookOfTheDay | typeof artistOfTheWeek | typeof publisherOfTheWeek,
  id: string,
  url: string,
): Promise<string | null> {
  const path = pathFromUrl(url);
  if (!path) return `Invalid URL for ${id}`;

  try {
    await deleteImage(path);
    await db
      .update(table)
      .set({ artistProvidedStoryImageUrl: null, updatedAt: new Date() })
      .where(eq(table.id, id));
    return null;
  } catch (error) {
    return `Failed to delete ${path}: ${String(error)}`;
  }
}

export type StoryUploadCleanupResult = {
  deleted: number;
  errors: string[];
};

export type RunStoryUploadCleanupResult = Result<
  StoryUploadCleanupResult,
  { reason: string }
>;

/** Deletes artist-provided story images for features older than 7 days. */
export async function runStoryUploadCleanup(
  asOf: Date = new Date(),
): Promise<RunStoryUploadCleanupResult> {
  const cutoff = toUtcStartOfDay(asOf);
  cutoff.setUTCDate(cutoff.getUTCDate() - CLEANUP_AGE_DAYS);

  let deleted = 0;
  const errors: string[] = [];

  const botdRows = await db
    .select({
      id: bookOfTheDay.id,
      artistProvidedStoryImageUrl: bookOfTheDay.artistProvidedStoryImageUrl,
    })
    .from(bookOfTheDay)
    .where(
      and(
        isNotNull(bookOfTheDay.artistProvidedStoryImageUrl),
        lt(bookOfTheDay.date, cutoff),
      ),
    );

  for (const row of botdRows) {
    if (!row.artistProvidedStoryImageUrl) continue;
    const error = await deleteRowImage(
      bookOfTheDay,
      row.id,
      row.artistProvidedStoryImageUrl,
    );
    if (error) errors.push(error);
    else deleted++;
  }

  const aotwRows = await db
    .select({
      id: artistOfTheWeek.id,
      artistProvidedStoryImageUrl: artistOfTheWeek.artistProvidedStoryImageUrl,
    })
    .from(artistOfTheWeek)
    .where(
      and(
        isNotNull(artistOfTheWeek.artistProvidedStoryImageUrl),
        lt(artistOfTheWeek.weekStart, cutoff),
      ),
    );

  for (const row of aotwRows) {
    if (!row.artistProvidedStoryImageUrl) continue;
    const error = await deleteRowImage(
      artistOfTheWeek,
      row.id,
      row.artistProvidedStoryImageUrl,
    );
    if (error) errors.push(error);
    else deleted++;
  }

  const potwRows = await db
    .select({
      id: publisherOfTheWeek.id,
      artistProvidedStoryImageUrl: publisherOfTheWeek.artistProvidedStoryImageUrl,
    })
    .from(publisherOfTheWeek)
    .where(
      and(
        isNotNull(publisherOfTheWeek.artistProvidedStoryImageUrl),
        lt(publisherOfTheWeek.weekStart, cutoff),
      ),
    );

  for (const row of potwRows) {
    if (!row.artistProvidedStoryImageUrl) continue;
    const error = await deleteRowImage(
      publisherOfTheWeek,
      row.id,
      row.artistProvidedStoryImageUrl,
    );
    if (error) errors.push(error);
    else deleted++;
  }

  return ok({ deleted, errors });
}
