/**
 * Export social media data for a given week:
 * 7 Book of the Day entries, Artist of the Week, Publisher of the Week.
 * Outputs a Markdown document, downloads cover images to output/social-images-YYYY-MM-DD/,
 * and lists image URLs. Captions match the admin Instagram planner defaults.
 *
 * Usage: npx tsx scripts/export-social-week.ts [YYYY-MM-DD]
 *   If no date is given, uses the current week (Monday–Sunday).
 */

import "./env";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { db } from "../src/db/client";
import {
  artistOfTheWeek,
  bookOfTheDay,
  publisherOfTheWeek,
} from "../src/db/schema";
import { BOOK_CARD_COLUMNS } from "../src/constants/queries";
import { toDateString, toWeekStart } from "../src/lib/utils";
import { and, eq, gte, lte } from "drizzle-orm";
import {
  buildBotdInstagramCaption,
  buildDefaultArtistInstagramCaption,
  buildDefaultPublisherInstagramCaption,
} from "../src/features/dashboard/admin/planner/social-media/instagramCaption";

const BOOK_COLUMNS_FOR_EXPORT = {
  ...BOOK_CARD_COLUMNS,
  description: true,
} as const;

const CREATOR_COLUMNS_WITH_INSTAGRAM = {
  id: true,
  displayName: true,
  slug: true,
  coverUrl: true,
  status: true,
  bio: true,
  instagram: true,
} as const;

function getExtension(url: string): string {
  const pathname = new URL(url).pathname;
  const i = pathname.lastIndexOf(".");
  return i > -1 ? pathname.slice(i) : ".jpg";
}

async function downloadImageToFile(
  url: string,
  outDir: string,
  prefix: string,
): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) {
      console.error("Failed to download", url, res.status);
      return null;
    }
    mkdirSync(outDir, { recursive: true });
    const ext = getExtension(url);
    const filePath = join(outDir, `${prefix}${ext}`);
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(filePath, buf);
    console.log("Saved:", filePath);
    return filePath;
  } catch (err) {
    console.error("Error downloading", url, err);
    return null;
  }
}

async function run() {
  const dateArg = process.argv[2];
  const forDate = dateArg ? new Date(dateArg) : new Date();
  const weekStart = toWeekStart(forDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

  if (isNaN(forDate.getTime())) {
    console.error("Invalid date. Use YYYY-MM-DD.");
    process.exit(1);
  }

  console.log(
    "Fetching data for week",
    toDateString(weekStart),
    "to",
    toDateString(weekEnd),
  );

  const [botdRows, aotwRow, potwRow] = await Promise.all([
    db.query.bookOfTheDay.findMany({
      where: and(
        gte(bookOfTheDay.date, weekStart),
        lte(bookOfTheDay.date, weekEnd),
      ),
      orderBy: [bookOfTheDay.date],
      with: {
        book: {
          columns: BOOK_COLUMNS_FOR_EXPORT,
          with: {
            artist: { columns: CREATOR_COLUMNS_WITH_INSTAGRAM },
            publisher: { columns: CREATOR_COLUMNS_WITH_INSTAGRAM },
            images: {
              columns: { id: true, imageUrl: true },
              orderBy: (img, { asc }) => [asc(img.sortOrder)],
            },
          },
        },
      },
    }),
    db.query.artistOfTheWeek.findFirst({
      where: eq(artistOfTheWeek.weekStart, weekStart),
      with: { creator: { columns: CREATOR_COLUMNS_WITH_INSTAGRAM } },
    }),
    db.query.publisherOfTheWeek.findFirst({
      where: eq(publisherOfTheWeek.weekStart, weekStart),
      with: { creator: { columns: CREATOR_COLUMNS_WITH_INSTAGRAM } },
    }),
  ]);

  const weekStr = toDateString(weekStart);
  const imagesDir = join(process.cwd(), "output", `social-images-${weekStr}`);
  const downloadedPaths: string[] = [];
  const lines: string[] = [];

  for (const row of botdRows) {
    const b = row.book;
    if (!b) continue;
    const dayStr = toDateString(row.date);
    const cover = b.coverUrl;
    const gallery = b.images ?? [];
    const bookPrefix = `${dayStr}-${b.slug}`;
    if (cover) {
      const path = await downloadImageToFile(
        cover,
        imagesDir,
        `${bookPrefix}-1`,
      );
      if (path) downloadedPaths.push(path);
    }
    for (let g = 0; g < gallery.length; g++) {
      const url = gallery[g]?.imageUrl;
      if (url) {
        const path = await downloadImageToFile(
          url,
          imagesDir,
          `${bookPrefix}-${g + 2}`,
        );
        if (path) downloadedPaths.push(path);
      }
    }

    const caption = buildBotdInstagramCaption(
      {
        title: b.title,
        slug: b.slug,
        artist: b.artist,
        publisher: b.publisher,
        tags: b.tags,
      },
      row.instagramCaption,
    );

    lines.push(`Book of The Day – ${dayStr}`);
    lines.push("");
    lines.push("Example post (copy for Instagram):");
    lines.push("```");
    lines.push(caption);
    lines.push("```");
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  if (botdRows.length === 0) {
    lines.push("(No Book of the Day entries scheduled this week)");
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  lines.push("Artist of the Week:");
  lines.push("");
  if (aotwRow?.creator) {
    const c = aotwRow.creator;
    if (c.coverUrl) {
      const path = await downloadImageToFile(
        c.coverUrl,
        imagesDir,
        "artist-cover",
      );
      if (path) downloadedPaths.push(path);
    }
    const caption =
      aotwRow.instagramCaption ?? buildDefaultArtistInstagramCaption(c);
    lines.push("Example post (copy for Instagram):");
    lines.push("```");
    lines.push(caption);
    lines.push("```");
  } else {
    lines.push("(Not set for this week)");
  }
  lines.push("");
  lines.push("---");
  lines.push("");

  lines.push("Publisher of the Week:");
  lines.push("");
  if (potwRow?.creator) {
    const c = potwRow.creator;
    if (c.coverUrl) {
      const path = await downloadImageToFile(
        c.coverUrl,
        imagesDir,
        "publisher-cover",
      );
      if (path) downloadedPaths.push(path);
    }
    const caption =
      potwRow.instagramCaption ?? buildDefaultPublisherInstagramCaption(c);
    lines.push("Example post (copy for Instagram):");
    lines.push("```");
    lines.push(caption);
    lines.push("```");
  } else {
    lines.push("(Not set for this week)");
  }
  lines.push("");
  lines.push("---");
  lines.push("");

  const md = lines.join("\n");
  const outDir = join(process.cwd(), "output");
  mkdirSync(outDir, { recursive: true });
  const filename = `social-week-${weekStr}.md`;
  const filepath = join(outDir, filename);
  writeFileSync(filepath, md, "utf-8");
  console.log("Wrote:", filepath);
  console.log("Images downloaded to:", imagesDir);
  console.log("Downloaded:", downloadedPaths.length, "images");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
