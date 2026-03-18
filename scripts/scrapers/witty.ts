/**
 * Witty Books scraper
 * https://witty-books.com/Books
 * Single page: title = h1, artist = h2, description = everything after h2 (br tags removed)
 *
 * Run: npx tsx scripts/scrapers/wittybooks.ts [output-path]
 */

import "../env";
import * as cheerio from "cheerio";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import {
  artistExistsInDb,
  decodeHtmlEntities,
  fetchHtml,
  normalizeUrl,
  rowToCsv,
} from "../scraperUtils";

const BASE = "https://witty-books.com";
const BOOKS_URL = `${BASE}/Books`;

const SKIP_PATHS = new Set([
  "/",
  "/Books",
  "/Info",
  "/Prints",
  "/Cassette",
  "/Merch",
  "/Project",
  "/books", // lowercase if present
]);

function getBookUrlsFromHtml(html: string): string[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const urls: string[] = [];

  $("a[href]").each((_, el) => {
    let href = $(el).attr("href")?.trim();
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("javascript:")
    )
      return;
    const full = normalizeUrl(href.split("?")[0], BASE);
    try {
      const path = new URL(full).pathname;
      if (SKIP_PATHS.has(path) || path.startsWith("/Books")) return;
      // Book pages are typically single path segment like /xxx-Aa-vv
      const segments = path.split("/").filter(Boolean);
      if (segments.length !== 1) return; // adjust if books use /category/slug
      if (!seen.has(full)) {
        seen.add(full);
        urls.push(full);
      }
    } catch {
      // ignore invalid URLs
    }
  });

  return urls;
}

async function getAllBookUrls(): Promise<string[]> {
  console.log("Fetching books listing:", BOOKS_URL);
  const html = await fetchHtml(BOOKS_URL);
  return getBookUrlsFromHtml(html);
}

async function scrapeBook(bookUrl: string): Promise<{
  title: string;
  artist: string;
  artistExistsInDb: boolean;
  description: string;
  coverUrl: string;
  images: string;
  availability: string;
  purchaseLink: string;
}> {
  const html = await fetchHtml(bookUrl);
  const $ = cheerio.load(html);

  const title = $("h1").first().text().trim() || "";
  const artist = $("h2").first().text().trim() || "";

  // Description = everything after h2, then remove <br/> (and <br>) and strip tags
  let description = "";
  const h2 = $("h2").first();
  if (h2.length) {
    const after: string[] = [];
    let el: cheerio.Element | null = h2.get(0);
    while (el) {
      const next = el.next;
      if (!next) break;
      if (next.type === "tag") {
        after.push($.html(next));
        el = next;
      } else if (next.type === "text") {
        after.push((next as cheerio.Text).data ?? "");
        el = next;
      } else {
        el = next;
      }
    }
    let descHtml = after.join("");
    descHtml = descHtml.replace(/<br\s*\/?>/gi, " "); // remove br tags (replace with space)
    description = decodeHtmlEntities(descHtml)
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const coverUrl = normalizeUrl(
    $('meta[property="og:image"]').attr("content") ?? "",
    BASE,
  );
  const images = ""; // add if you have gallery images
  const availability = "available"; // adjust if site exposes stock
  const artistExists = artist ? await artistExistsInDb(artist) : false;

  return {
    title,
    artist,
    artistExistsInDb: artistExists,
    description,
    coverUrl,
    images,
    availability,
    purchaseLink: bookUrl,
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "wittybooks.csv");

  console.log("Fetching book URLs from", BOOKS_URL);
  const bookUrls = await getAllBookUrls();
  console.log(`Found ${bookUrls.length} book URLs.`);

  const header: Record<string, string> = {
    title: "title",
    artist: "artist",
    artistExistsInDb: "artistExistsInDb",
    description: "description",
    coverUrl: "coverUrl",
    images: "images",
    availability: "availability",
    purchaseLink: "purchaseLink",
  };
  const lines: string[] = [rowToCsv(header)];

  for (let i = 0; i < bookUrls.length; i++) {
    const url = bookUrls[i];
    console.log(`[${i + 1}/${bookUrls.length}] ${url}`);
    try {
      const row = await scrapeBook(url);
      lines.push(rowToCsv({ ...row, artistExistsInDb: row.artistExistsInDb }));
    } catch (err) {
      console.error(`Error scraping ${url}:`, err);
    }
  }

  await mkdir(join(outPath, ".."), { recursive: true });
  await writeFile(outPath, lines.join("\n"), "utf8");
  console.log(`Wrote ${lines.length - 1} rows to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
