/**
 * Export this week's (or a given week's) social media data:
 * Book of the Week, Artist of the Week, Publisher of the Week, 5 Featured Books.
 * Outputs a Markdown document, downloads cover images to output/social-images-YYYY-MM-DD/,
 * and lists image URLs. Includes Instagram handles derived from creator Instagram URLs.
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
  bookOfTheWeek,
  featuredBooksOfTheWeek,
  publisherOfTheWeek,
} from "../src/db/schema";
import { BOOK_CARD_COLUMNS } from "../src/constants/queries";
import { eq } from "drizzle-orm";

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

function toWeekStart(d: Date): Date {
  const date = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  const day = date.getUTCDay();
  const daysToMonday = day === 0 ? 6 : day - 1;
  date.setUTCDate(date.getUTCDate() - daysToMonday);
  return date;
}

function formatWeekLabel(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setUTCDate(end.getUTCDate() + 6);
  return `${weekStart.toISOString().slice(0, 10)} – ${end.toISOString().slice(0, 10)}`;
}

/** ISO week number (1–53) for the given Monday date */
function getWeekNumber(weekStart: Date): number {
  const d = new Date(weekStart);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 3 - ((d.getUTCDay() + 6) % 7));
  const jan1 = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return 1 + Math.round(((d.getTime() - jan1.getTime()) / 86400000 - 3 + ((jan1.getUTCDay() + 6) % 7)) / 7);
}

function extractInstagramHandle(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.trim());
    if (!u.hostname.includes("instagram.com")) return null;
    const segments = u.pathname.split("/").filter(Boolean);
    const raw = segments[0];
    if (!raw) return null;
    return "@" + raw;
  } catch {
    const match = url.match(/instagram\.com\/([^/?#]+)/i);
    if (!match) return null;
    return "@" + match[1];
  }
}

const SITE_URL = "https://photobookers.com";

function bookUrl(slug: string) {
  return `${SITE_URL}/books/${slug}`;
}
function creatorUrl(slug: string) {
  return `${SITE_URL}/creators/${slug}`;
}

async function run() {
  const dateArg = process.argv[2];
  const forDate = dateArg ? new Date(dateArg) : new Date();
  const weekStart = toWeekStart(forDate);

  if (isNaN(forDate.getTime())) {
    console.error("Invalid date. Use YYYY-MM-DD.");
    process.exit(1);
  }

  console.log(
    "Fetching data for week starting",
    weekStart.toISOString().slice(0, 10),
  );

  const [botwRow, aotwRow, potwRow, featuredRows] = await Promise.all([
    db.query.bookOfTheWeek.findFirst({
      where: eq(bookOfTheWeek.weekStart, weekStart),
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
    db.query.featuredBooksOfTheWeek.findMany({
      where: eq(featuredBooksOfTheWeek.weekStart, weekStart),
      orderBy: [featuredBooksOfTheWeek.position],
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
  ]);

  const weekStr = weekStart.toISOString().slice(0, 10);
  const weekNum = getWeekNumber(weekStart);
  const imagesDir = join(process.cwd(), "output", `social-images-${weekStr}`);
  const downloadedPaths: string[] = [];
  const imageUrls: string[] = []; // kept for any leftover refs; not written to file
  const lines: string[] = [];

  // ---- Book of the Week (post-style) ----
  lines.push("Book of The Week");
  lines.push("");
  if (botwRow?.book) {
    const b = botwRow.book;
    const artist = b.artist;
    const publisher = b.publisher;
    const cover = b.coverUrl;
    const gallery = b.images ?? [];
    const bookPrefix = b.slug;
    if (cover) {
      const path = await downloadImageToFile(cover, imagesDir, `${bookPrefix}-1`);
      if (path) downloadedPaths.push(path);
    }
    for (let g = 0; g < gallery.length; g++) {
      const url = gallery[g]?.imageUrl;
      if (url) {
        const path = await downloadImageToFile(url, imagesDir, `${bookPrefix}-${g + 2}`);
        if (path) downloadedPaths.push(path);
      }
    }
    const botwPost: string[] = [];
    botwPost.push("Book of The Week");
    botwPost.push("");
    botwPost.push(b.title);
    if (artist) botwPost.push(artist.displayName);
    if (publisher) botwPost.push(publisher.displayName);
    botwPost.push("");
    if (botwRow.text) botwPost.push(botwRow.text);
    botwPost.push("");
    if (artist) {
      const h = extractInstagramHandle(artist.instagram);
      if (h) botwPost.push(h);
    }
    if (publisher) {
      const h = extractInstagramHandle(publisher.instagram);
      if (h) botwPost.push(h);
    }
    lines.push("Example post (copy for Instagram):");
    lines.push("```");
    lines.push(...botwPost);
    lines.push("```");
  } else {
    lines.push("(Not set for this week)");
  }
  lines.push("");
  lines.push("---");
  lines.push("");

  // ---- Featured Books (post-style) ----
  if (featuredRows.length > 0) {
    for (let i = 0; i < featuredRows.length; i++) {
      const row = featuredRows[i];
      const b = row.book;
      if (!b) continue;
      const cover = b.coverUrl;
      const gallery = b.images ?? [];
      const bookPrefix = b.slug;
      if (cover) {
        const path = await downloadImageToFile(cover, imagesDir, `${bookPrefix}-1`);
        if (path) downloadedPaths.push(path);
      }
      for (let g = 0; g < gallery.length; g++) {
        const url = gallery[g]?.imageUrl;
        if (url) {
          const path = await downloadImageToFile(url, imagesDir, `${bookPrefix}-${g + 2}`);
          if (path) downloadedPaths.push(path);
        }
      }
      const desc = (b as { description?: string | null }).description;
      const featuredPost: string[] = [];
      featuredPost.push(`Week ${weekNum}: Featured #${i + 1}`);
      featuredPost.push("");
      featuredPost.push(b.title);
      if (b.artist) featuredPost.push(b.artist.displayName);
      if (b.publisher) featuredPost.push(b.publisher.displayName);
      featuredPost.push("");
      if (desc) featuredPost.push(desc);
      featuredPost.push("");
      if (b.publisher) {
        const h = extractInstagramHandle(b.publisher.instagram);
        if (h) featuredPost.push(h);
      }
      if (b.artist) {
        const h = extractInstagramHandle(b.artist.instagram);
        if (h) featuredPost.push(h);
      }
      lines.push(`Week ${weekNum}: Featured #${i + 1}`);
      lines.push("");
      lines.push("Example post (copy for Instagram):");
      lines.push("```");
      lines.push(...featuredPost);
      lines.push("```");
      lines.push("");
      lines.push("---");
      lines.push("");
    }
  }

  // ---- Artist of the Week (post-style) ----
  lines.push("Artist of the Week:");
  lines.push("");
  if (aotwRow?.creator) {
    const c = aotwRow.creator;
    if (c.coverUrl) {
      const path = await downloadImageToFile(c.coverUrl, imagesDir, "artist-cover");
      if (path) downloadedPaths.push(path);
    }
    const artistPost: string[] = [];
    artistPost.push("Artist of the Week:");
    artistPost.push("");
    artistPost.push(c.displayName);
    artistPost.push("");
    if (aotwRow.text) artistPost.push(aotwRow.text);
    artistPost.push("");
    const h = extractInstagramHandle(c.instagram);
    if (h) artistPost.push(h);
    lines.push("Example post (copy for Instagram):");
    lines.push("```");
    lines.push(...artistPost);
    lines.push("```");
  } else {
    lines.push("(Not set for this week)");
  }
  lines.push("");
  lines.push("---");
  lines.push("");

  // ---- Publisher of the Week (post-style) ----
  lines.push("Publisher of the Week:");
  lines.push("");
  if (potwRow?.creator) {
    const c = potwRow.creator;
    if (c.coverUrl) {
      const path = await downloadImageToFile(c.coverUrl, imagesDir, "publisher-cover");
      if (path) downloadedPaths.push(path);
    }
    const publisherPost: string[] = [];
    publisherPost.push("Publisher of the Week:");
    publisherPost.push("");
    publisherPost.push(c.displayName);
    publisherPost.push("");
    if (potwRow.text) publisherPost.push(potwRow.text);
    publisherPost.push("");
    const ph = extractInstagramHandle(c.instagram);
    if (ph) publisherPost.push(ph);
    lines.push("Example post (copy for Instagram):");
    lines.push("```");
    lines.push(...publisherPost);
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
