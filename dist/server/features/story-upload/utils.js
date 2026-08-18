import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  artistOfTheWeek,
  bookOfTheDay,
  publisherOfTheWeek
} from "../../db/schema.js";
async function getStoryUploadRow(kind, id) {
  switch (kind) {
    case "botd":
      return db.query.bookOfTheDay.findFirst({
        where: eq(bookOfTheDay.id, id),
        with: {
          book: {
            columns: { title: true },
            with: {
              artist: { columns: { displayName: true } },
              publisher: { columns: { displayName: true } }
            }
          }
        }
      });
    case "aotw":
      return db.query.artistOfTheWeek.findFirst({
        where: eq(artistOfTheWeek.id, id),
        with: { creator: { columns: { displayName: true } } }
      });
    case "potw":
      return db.query.publisherOfTheWeek.findFirst({
        where: eq(publisherOfTheWeek.id, id),
        with: { creator: { columns: { displayName: true } } }
      });
  }
}
async function setStoryUploadImageUrl(kind, id, url) {
  const patch = { artistProvidedStoryImageUrl: url, updatedAt: /* @__PURE__ */ new Date() };
  switch (kind) {
    case "botd":
      return db.update(bookOfTheDay).set(patch).where(eq(bookOfTheDay.id, id));
    case "aotw":
      return db.update(artistOfTheWeek).set(patch).where(eq(artistOfTheWeek.id, id));
    case "potw":
      return db.update(publisherOfTheWeek).set(patch).where(eq(publisherOfTheWeek.id, id));
  }
}
function storyUploadTitle(kind, row) {
  if (!row) return "Instagram Story";
  if (kind === "botd" && "book" in row && row.book) {
    return row.book.title;
  }
  if ((kind === "aotw" || kind === "potw") && "creator" in row && row.creator) {
    return row.creator.displayName;
  }
  return "Instagram Story";
}
function storyUploadCredits(kind, row) {
  if (!row || kind !== "botd" || !("book" in row) || !row.book) return null;
  return [row.book.artist?.displayName, row.book.publisher?.displayName].filter(Boolean).join(" \xB7 ") || null;
}
function storyUploadLabel(kind) {
  if (kind === "botd") return "BOOK OF THE DAY";
  if (kind === "aotw") return "ARTIST OF THE WEEK";
  return "PUBLISHER OF THE WEEK";
}
export {
  getStoryUploadRow,
  setStoryUploadImageUrl,
  storyUploadCredits,
  storyUploadLabel,
  storyUploadTitle
};
