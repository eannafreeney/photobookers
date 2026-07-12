/**
 * Preview Instagram spotlight lead slides (BOTD, AOTW, POTW, new creator).
 *
 * Usage:
 *   npx tsx scripts/preview-botd-instagram-slide.ts
 *   npx tsx scripts/preview-botd-instagram-slide.ts https://example.com/cover.jpg
 *
 * Writes variants to output/instagram-spotlight-leads/
 */

import "./env";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "../src/db/client";
import {
  artistOfTheWeek,
  bookOfTheDay,
  creators,
  publisherOfTheWeek,
} from "../src/db/schema";
import { getCreatorBookCoverUrls } from "../src/domain/planner/instagramSlides/getCreatorBookCoverUrls";
import {
  buildBookCreditsSubtitle,
  NEW_CREATOR_CAROUSEL_BOOK_LIMIT,
  renderSpotlightLeadSlide,
} from "../src/domain/planner/instagramSlides/renderSpotlightLeadSlide";
import { resolveInstagramImageUrls } from "../src/features/dashboard/admin/planner/social-media/instagramUtils";
import { toUtcStartOfDay, toWeekStart } from "../src/lib/utils";

async function resolveSampleBotd(): Promise<{
  coverUrl: string;
  title: string;
  subtitle: string | null;
}> {
  const cliUrl = process.argv[2]?.trim();
  const row = await db.query.bookOfTheDay.findFirst({
    where: eq(bookOfTheDay.date, toUtcStartOfDay(new Date())),
    columns: { featuredImageUrl: true, instagramImageUrls: true },
    with: {
      book: {
        columns: { title: true, coverUrl: true },
        with: {
          artist: { columns: { displayName: true } },
          publisher: { columns: { displayName: true } },
        },
      },
    },
  });

  const coverUrl =
    cliUrl ||
    (row ? resolveInstagramImageUrls(row)[0] : null) ||
    row?.book?.coverUrl;
  if (!coverUrl) {
    const fallback = await db.query.bookOfTheDay.findFirst({
      orderBy: [desc(bookOfTheDay.date)],
      columns: { featuredImageUrl: true, instagramImageUrls: true },
      with: {
        book: {
          columns: { title: true, coverUrl: true },
          with: {
            artist: { columns: { displayName: true } },
            publisher: { columns: { displayName: true } },
          },
        },
      },
    });
    const fallbackUrl = fallback
      ? resolveInstagramImageUrls(fallback)[0] ?? fallback.book?.coverUrl
      : null;
    if (!fallbackUrl) {
      throw new Error(
        "No cover found. Pass a URL: npx tsx scripts/preview-botd-instagram-slide.ts <url>",
      );
    }
    return {
      coverUrl: fallbackUrl,
      title: fallback?.book?.title ?? "Sample book",
      subtitle: fallback?.book
        ? buildBookCreditsSubtitle(fallback.book)
        : null,
    };
  }

  return {
    coverUrl,
    title: row?.book?.title ?? "Sample book",
    subtitle: row?.book ? buildBookCreditsSubtitle(row.book) : null,
  };
}

async function resolveArtistCoverUrl(): Promise<{
  coverUrl: string;
  displayName: string;
} | null> {
  const weekStart = toWeekStart(new Date());

  const currentWeek = await db.query.artistOfTheWeek.findFirst({
    where: eq(artistOfTheWeek.weekStart, weekStart),
    with: {
      creator: { columns: { coverUrl: true, displayName: true } },
    },
  });
  if (currentWeek?.creator?.coverUrl) {
    return {
      coverUrl: currentWeek.creator.coverUrl,
      displayName: currentWeek.creator.displayName,
    };
  }

  const latest = await db.query.artistOfTheWeek.findFirst({
    orderBy: [desc(artistOfTheWeek.weekStart)],
    with: {
      creator: { columns: { coverUrl: true, displayName: true } },
    },
  });
  if (latest?.creator?.coverUrl) {
    return {
      coverUrl: latest.creator.coverUrl,
      displayName: latest.creator.displayName,
    };
  }

  const creator = await db.query.creators.findFirst({
    where: and(
      eq(creators.type, "artist"),
      eq(creators.status, "verified"),
      isNotNull(creators.coverUrl),
    ),
    orderBy: [desc(creators.updatedAt)],
    columns: { coverUrl: true, displayName: true },
  });
  return creator?.coverUrl
    ? { coverUrl: creator.coverUrl, displayName: creator.displayName }
    : null;
}

async function resolvePublisherCoverUrl(): Promise<{
  coverUrl: string;
  displayName: string;
} | null> {
  const weekStart = toWeekStart(new Date());

  const currentWeek = await db.query.publisherOfTheWeek.findFirst({
    where: eq(publisherOfTheWeek.weekStart, weekStart),
    with: {
      creator: { columns: { coverUrl: true, displayName: true } },
    },
  });
  if (currentWeek?.creator?.coverUrl) {
    return {
      coverUrl: currentWeek.creator.coverUrl,
      displayName: currentWeek.creator.displayName,
    };
  }

  const latest = await db.query.publisherOfTheWeek.findFirst({
    orderBy: [desc(publisherOfTheWeek.weekStart)],
    with: {
      creator: { columns: { coverUrl: true, displayName: true } },
    },
  });
  if (latest?.creator?.coverUrl) {
    return {
      coverUrl: latest.creator.coverUrl,
      displayName: latest.creator.displayName,
    };
  }

  const creator = await db.query.creators.findFirst({
    where: and(
      eq(creators.type, "publisher"),
      eq(creators.status, "verified"),
      isNotNull(creators.coverUrl),
    ),
    orderBy: [desc(creators.updatedAt)],
    columns: { coverUrl: true, displayName: true },
  });
  return creator?.coverUrl
    ? { coverUrl: creator.coverUrl, displayName: creator.displayName }
    : null;
}

async function resolveSampleNewCreator(): Promise<{
  coverUrl: string;
  displayName: string;
  bookCoverUrls: string[];
} | null> {
  const creator = await db.query.creators.findFirst({
    where: and(
      eq(creators.status, "verified"),
      isNotNull(creators.coverUrl),
    ),
    orderBy: [desc(creators.verifiedAt)],
    columns: { id: true, type: true, coverUrl: true, displayName: true },
  });
  if (!creator?.coverUrl) return null;

  const bookCoverUrls = await getCreatorBookCoverUrls(
    creator.type,
    creator.id,
    NEW_CREATOR_CAROUSEL_BOOK_LIMIT,
  );
  return {
    coverUrl: creator.coverUrl,
    displayName: creator.displayName,
    bookCoverUrls,
  };
}

async function run() {
  const botd = await resolveSampleBotd();
  const artist = await resolveArtistCoverUrl();
  const publisher = await resolvePublisherCoverUrl();
  const newCreator = await resolveSampleNewCreator();

  const outDir = join(process.cwd(), "output", "instagram-spotlight-leads");
  mkdirSync(outDir, { recursive: true });

  console.log("BOTD source (book):", botd.coverUrl);
  const botdSlide = await renderSpotlightLeadSlide(
    botd.coverUrl,
    "Book of the Day",
    { title: botd.title, subtitle: botd.subtitle },
  );
  const botdPath = join(outDir, "book-of-the-day.webp");
  writeFileSync(botdPath, botdSlide);
  console.log("Wrote:", botdPath);

  if (artist) {
    console.log("AOTW source (creator):", artist.coverUrl);
    const aotwSlide = await renderSpotlightLeadSlide(
      artist.coverUrl,
      "Artist of the Week",
      { title: artist.displayName },
    );
    const aotwPath = join(outDir, "artist-of-the-week.webp");
    writeFileSync(aotwPath, aotwSlide);
    console.log("Wrote:", aotwPath);
  } else {
    console.warn("Skipped AOTW preview — no artist coverUrl found");
  }

  if (publisher) {
    console.log("POTW source (creator):", publisher.coverUrl);
    const potwSlide = await renderSpotlightLeadSlide(
      publisher.coverUrl,
      "Publisher of the Week",
      { title: publisher.displayName },
    );
    const potwPath = join(outDir, "publisher-of-the-week.webp");
    writeFileSync(potwPath, potwSlide);
    console.log("Wrote:", potwPath);
  } else {
    console.warn("Skipped POTW preview — no publisher coverUrl found");
  }

  if (newCreator) {
    console.log("New creator lead source (creator):", newCreator.coverUrl);
    const lead = await renderSpotlightLeadSlide(
      newCreator.coverUrl,
      "New on photobookers",
      { title: newCreator.displayName },
    );
    writeFileSync(join(outDir, "new-on-photobookers-lead.webp"), lead);
    console.log("Wrote:", join(outDir, "new-on-photobookers-lead.webp"));

    for (let index = 0; index < newCreator.bookCoverUrls.length; index += 1) {
      const url = newCreator.bookCoverUrls[index];
      if (!url) continue;
      console.log(`New creator book ${index + 1} (raw, not rendered):`, url);
    }
  } else {
    console.warn("Skipped new-creator preview — no verified creator with coverUrl");
  }

  console.log("Done:", outDir);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
