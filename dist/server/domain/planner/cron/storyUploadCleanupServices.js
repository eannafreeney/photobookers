import { and, eq, isNotNull, lt } from "drizzle-orm";
import { db } from "../../../db/client.js";
import {
  artistOfTheWeek,
  bookOfTheDay,
  publisherOfTheWeek
} from "../../../db/schema.js";
import { deleteImage } from "../../../services/storage.js";
import { ok } from "../../../lib/result.js";
import { toUtcStartOfDay } from "../../../lib/utils.js";
const CLEANUP_AGE_DAYS = 7;
function pathFromUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/^\/+/, "");
  } catch {
    return null;
  }
}
async function deleteRowImage(table, id, url) {
  const path = pathFromUrl(url);
  if (!path) return `Invalid URL for ${id}`;
  try {
    await deleteImage(path);
    await db.update(table).set({ artistProvidedStoryImageUrl: null, updatedAt: /* @__PURE__ */ new Date() }).where(eq(table.id, id));
    return null;
  } catch (error) {
    return `Failed to delete ${path}: ${String(error)}`;
  }
}
async function runStoryUploadCleanup(asOf = /* @__PURE__ */ new Date()) {
  const cutoff = toUtcStartOfDay(asOf);
  cutoff.setUTCDate(cutoff.getUTCDate() - CLEANUP_AGE_DAYS);
  let deleted = 0;
  const errors = [];
  const botdRows = await db.select({
    id: bookOfTheDay.id,
    artistProvidedStoryImageUrl: bookOfTheDay.artistProvidedStoryImageUrl
  }).from(bookOfTheDay).where(
    and(
      isNotNull(bookOfTheDay.artistProvidedStoryImageUrl),
      lt(bookOfTheDay.date, cutoff)
    )
  );
  for (const row of botdRows) {
    if (!row.artistProvidedStoryImageUrl) continue;
    const error = await deleteRowImage(
      bookOfTheDay,
      row.id,
      row.artistProvidedStoryImageUrl
    );
    if (error) errors.push(error);
    else deleted++;
  }
  const aotwRows = await db.select({
    id: artistOfTheWeek.id,
    artistProvidedStoryImageUrl: artistOfTheWeek.artistProvidedStoryImageUrl
  }).from(artistOfTheWeek).where(
    and(
      isNotNull(artistOfTheWeek.artistProvidedStoryImageUrl),
      lt(artistOfTheWeek.weekStart, cutoff)
    )
  );
  for (const row of aotwRows) {
    if (!row.artistProvidedStoryImageUrl) continue;
    const error = await deleteRowImage(
      artistOfTheWeek,
      row.id,
      row.artistProvidedStoryImageUrl
    );
    if (error) errors.push(error);
    else deleted++;
  }
  const potwRows = await db.select({
    id: publisherOfTheWeek.id,
    artistProvidedStoryImageUrl: publisherOfTheWeek.artistProvidedStoryImageUrl
  }).from(publisherOfTheWeek).where(
    and(
      isNotNull(publisherOfTheWeek.artistProvidedStoryImageUrl),
      lt(publisherOfTheWeek.weekStart, cutoff)
    )
  );
  for (const row of potwRows) {
    if (!row.artistProvidedStoryImageUrl) continue;
    const error = await deleteRowImage(
      publisherOfTheWeek,
      row.id,
      row.artistProvidedStoryImageUrl
    );
    if (error) errors.push(error);
    else deleted++;
  }
  return ok({ deleted, errors });
}
export {
  runStoryUploadCleanup
};
