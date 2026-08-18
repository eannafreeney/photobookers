import { createRoute } from "hono-fsr";
import { db } from "../../../../db/client.js";
import {
  artistOfTheWeek,
  bookOfTheDay,
  publisherOfTheWeek
} from "../../../../db/schema.js";
import { eq } from "drizzle-orm";
import {
  renderBotdStoryBlurred,
  renderBotdStoryFullBleed
} from "../../../../domain/planner/instagramSlides/renderBotdStorySlide.js";
import { resolveBotdStoryImageUrl } from "../../../../features/dashboard/admin/planner/social-media/instagramUtils.js";
function parseKind(value) {
  if (value === "botd" || value === "aotw" || value === "potw") return value;
  return null;
}
async function getBotdRow(id) {
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
}
async function getSpotlightRow(kind, id) {
  if (kind === "aotw") {
    return db.query.artistOfTheWeek.findFirst({
      where: eq(artistOfTheWeek.id, id),
      with: { creator: { columns: { displayName: true } } }
    });
  }
  return db.query.publisherOfTheWeek.findFirst({
    where: eq(publisherOfTheWeek.id, id),
    with: { creator: { columns: { displayName: true } } }
  });
}
const GET = createRoute(async (c) => {
  const kind = parseKind(c.req.query("kind"));
  const id = c.req.query("id");
  const overrideImage = c.req.query("image")?.trim() || null;
  if (!kind || !id) {
    return c.text("Invalid parameters", 400);
  }
  let imageUrl = null;
  let title = "";
  let artistName = null;
  let publisherName = null;
  let hasArtistImage = false;
  if (kind === "botd") {
    const row = await getBotdRow(id);
    if (!row) return c.text("Not found", 404);
    imageUrl = overrideImage ?? resolveBotdStoryImageUrl(row);
    title = row.book?.title ?? "Book of the Day";
    artistName = row.book?.artist?.displayName ?? null;
    publisherName = row.book?.publisher?.displayName ?? null;
    hasArtistImage = Boolean(row.artistProvidedStoryImageUrl) && !overrideImage;
  } else {
    const row = await getSpotlightRow(kind, id);
    if (!row) return c.text("Not found", 404);
    imageUrl = overrideImage ?? row.artistProvidedStoryImageUrl ?? row.instagramImageUrls?.[0] ?? row.featuredImageUrl;
    title = row.creator?.displayName ?? (kind === "aotw" ? "Artist of the Week" : "Publisher of the Week");
    hasArtistImage = Boolean(row.artistProvidedStoryImageUrl) && !overrideImage;
  }
  if (!imageUrl) return c.text("No image", 404);
  const label = kind === "botd" ? "BOOK OF THE DAY" : kind === "aotw" ? "ARTIST OF THE WEEK" : "PUBLISHER OF THE WEEK";
  const buffer = hasArtistImage ? await renderBotdStoryFullBleed(imageUrl, {
    title,
    artistName,
    publisherName,
    label
  }) : await renderBotdStoryBlurred(imageUrl, {
    title,
    artistName,
    publisherName,
    label
  });
  return c.body(new Uint8Array(buffer), 200, {
    "Content-Type": "image/webp",
    // Short private cache so scrolling the prepare modal back up is cheap.
    "Cache-Control": "private, max-age=120"
  });
});
export {
  GET
};
