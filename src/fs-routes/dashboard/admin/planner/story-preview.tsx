import { createRoute } from "hono-fsr";
import { db } from "../../../../db/client";
import {
  artistOfTheWeek,
  bookOfTheDay,
  publisherOfTheWeek,
} from "../../../../db/schema";
import { eq } from "drizzle-orm";
import {
  renderBotdStoryBlurred,
  renderBotdStoryFullBleed,
} from "../../../../domain/planner/instagramSlides/renderBotdStorySlide";
import { resolveBotdStoryImageUrl } from "../../../../features/dashboard/admin/planner/social-media/instagramUtils";

type PreviewKind = "botd" | "aotw" | "potw";

function parseKind(value: string | undefined): PreviewKind | null {
  if (value === "botd" || value === "aotw" || value === "potw") return value;
  return null;
}

async function getBotdRow(id: string) {
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
}

async function getSpotlightRow(kind: "aotw" | "potw", id: string) {
  if (kind === "aotw") {
    return db.query.artistOfTheWeek.findFirst({
      where: eq(artistOfTheWeek.id, id),
      with: { creator: { columns: { displayName: true } } },
    });
  }
  return db.query.publisherOfTheWeek.findFirst({
    where: eq(publisherOfTheWeek.id, id),
    with: { creator: { columns: { displayName: true } } },
  });
}

export const GET = createRoute(async (c) => {
  const kind = parseKind(c.req.query("kind"));
  const id = c.req.query("id");
  if (!kind || !id) {
    return c.text("Invalid parameters", 400);
  }

  let imageUrl: string | null = null;
  let title = "";
  let artistName: string | null = null;
  let publisherName: string | null = null;
  let hasArtistImage = false;

  if (kind === "botd") {
    const row = await getBotdRow(id);
    if (!row) return c.text("Not found", 404);
    imageUrl = resolveBotdStoryImageUrl(row);
    title = row.book?.title ?? "Book of the Day";
    artistName = row.book?.artist?.displayName ?? null;
    publisherName = row.book?.publisher?.displayName ?? null;
    hasArtistImage = Boolean(row.artistProvidedStoryImageUrl);
  } else {
    const row = await getSpotlightRow(kind, id);
    if (!row) return c.text("Not found", 404);
    imageUrl = row.artistProvidedStoryImageUrl ?? row.instagramImageUrls?.[0] ?? row.featuredImageUrl;
    title = row.creator?.displayName ?? (kind === "aotw" ? "Artist of the Week" : "Publisher of the Week");
    hasArtistImage = Boolean(row.artistProvidedStoryImageUrl);
  }

  if (!imageUrl) return c.text("No image", 404);

  const buffer = hasArtistImage
    ? await renderBotdStoryFullBleed(imageUrl, { title, artistName, publisherName })
    : await renderBotdStoryBlurred(imageUrl, { title, artistName, publisherName });

  return c.body(new Uint8Array(buffer), 200, { "Content-Type": "image/webp" });
});
