import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import {
  artistOfTheWeek,
  bookOfTheDay,
  publisherOfTheWeek,
} from "../../db/schema";

export type StoryUploadKind = "botd" | "aotw" | "potw";

export async function getStoryUploadRow(kind: StoryUploadKind, id: string) {
  switch (kind) {
    case "botd":
      return db.query.bookOfTheDay.findFirst({
        where: eq(bookOfTheDay.id, id),
        with: {
          book: {
            columns: { title: true },
            with: {
              artist: { columns: { displayName: true } },
              publisher: { columns: { displayName: true } },
            },
          },
        },
      });
    case "aotw":
      return db.query.artistOfTheWeek.findFirst({
        where: eq(artistOfTheWeek.id, id),
        with: { creator: { columns: { displayName: true } } },
      });
    case "potw":
      return db.query.publisherOfTheWeek.findFirst({
        where: eq(publisherOfTheWeek.id, id),
        with: { creator: { columns: { displayName: true } } },
      });
  }
}

export type StoryUploadRow = NonNullable<
  Awaited<ReturnType<typeof getStoryUploadRow>>
>;

export async function setStoryUploadImageUrl(
  kind: StoryUploadKind,
  id: string,
  url: string,
) {
  const patch = { artistProvidedStoryImageUrl: url, updatedAt: new Date() };
  switch (kind) {
    case "botd":
      return db.update(bookOfTheDay).set(patch).where(eq(bookOfTheDay.id, id));
    case "aotw":
      return db
        .update(artistOfTheWeek)
        .set(patch)
        .where(eq(artistOfTheWeek.id, id));
    case "potw":
      return db
        .update(publisherOfTheWeek)
        .set(patch)
        .where(eq(publisherOfTheWeek.id, id));
  }
}

export function storyUploadTitle(
  kind: string,
  row: StoryUploadRow | null | undefined,
) {
  if (!row) return "Instagram Story";
  if (kind === "botd" && "book" in row && row.book) {
    return row.book.title;
  }
  if ((kind === "aotw" || kind === "potw") && "creator" in row && row.creator) {
    return row.creator.displayName;
  }
  return "Instagram Story";
}

export function storyUploadCredits(
  kind: string,
  row: StoryUploadRow | null | undefined,
) {
  if (!row || kind !== "botd" || !("book" in row) || !row.book) return null;
  return (
    [row.book.artist?.displayName, row.book.publisher?.displayName]
      .filter(Boolean)
      .join(" · ") || null
  );
}

export function storyUploadLabel(kind: StoryUploadKind) {
  if (kind === "botd") return "BOOK OF THE DAY";
  if (kind === "aotw") return "ARTIST OF THE WEEK";
  return "PUBLISHER OF THE WEEK";
}
