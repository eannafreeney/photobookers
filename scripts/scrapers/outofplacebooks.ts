/**
 * Out of Place Books scraper
 * https://www.outofplacebooks.com/books
 * Title: h4 text before "By", Artist: h4 text after "By"
 * Description: first <p> after the title/artist h4
 * Images: first image on page (cover)
 *
 * Run: npx tsx scripts/scrapers/outofplacebooks.ts [output-path]
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

const BASE = "https://www.outofplacebooks.com";
const BOOKS_PAGE = `${BASE}/books`;

/** Nav/site paths to exclude when discovering book links */
const EXCLUDED_PATHS = new Set(["/", "/books", "/contact", "/blog"]);

function getBookUrlsFromHtml(html: string): string[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const urls: string[] = [];

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    if (
      href.startsWith("#") ||
      href.startsWith("http") ||
      href.startsWith("mailto")
    )
      return;
    const path = href.split("?")[0];
    if (EXCLUDED_PATHS.has(path)) return;
    // Only include single-segment paths that look like book pages
    if (!path.startsWith("/") || path.split("/").length !== 2) return;
    const full = `${BASE}${path}`;
    if (seen.has(full)) return;
    seen.add(full);
    urls.push(full);
  });

  return urls;
}

async function getAllBookUrls(): Promise<string[]> {
  console.log(`Fetching books listing: ${BOOKS_PAGE}`);
  const html = await fetchHtml(BOOKS_PAGE);
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

  // Find the h4 that contains the title and artist (has "By" but not "Details")
  let title = "";
  let artist = "";

  $(".sqs-html-content h4").each((_, el) => {
    const rawHtml = $(el).html() ?? "";
    // Skip the specs h4 (contains "Details")
    if (rawHtml.includes("Details")) return;
    // Must contain "By" to be the title/artist block
    if (!rawHtml.toLowerCase().includes("by ") && !rawHtml.toLowerCase().includes("by<")) return;

    // Replace <br> variants with newlines, strip remaining tags
    const text = decodeHtmlEntities(
      rawHtml
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
    ).trim();

    // Split at first occurrence of "\nBy " or line-start "By "
    const byMatch = text.match(/^([\s\S]*?)\n[Bb]y\s+([\s\S]*)$/);
    if (byMatch) {
      title = byMatch[1].replace(/\n/g, " ").replace(/\s+/g, " ").trim();
      artist = byMatch[2].replace(/\n/g, " ").replace(/\s+/g, " ").trim();
    } else {
      // Fallback: whole text is title
      title = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
    }
    return false; // stop iterating
  });

  // Description: first <p> in the same content block as the title h4
  let description = "";
  $(".sqs-html-content").each((_, el) => {
    const block = $(el);
    const h4Text = block.find("h4").first().text();
    // Skip the details block
    if (h4Text.includes("Details")) return;
    const firstP = block.find("p").first();
    if (firstP.length) {
      description = decodeHtmlEntities(firstP.text())
        .replace(/\s+/g, " ")
        .trim();
      return false;
    }
  });

  // Cover image: first meaningful image on the page (skip logos/nav)
  const imageUrls: string[] = [];
  $("img[data-src], img[src]").each((_, el) => {
    const src =
      $(el).attr("data-src") || $(el).attr("src") || "";
    if (!src || src.startsWith("data:")) return;
    // Skip logo images
    if (src.includes("OutOfPlace_logo")) return;
    const full = normalizeUrl(src, BASE);
    if (!imageUrls.includes(full)) imageUrls.push(full);
  });

  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  // Purchase link: button linking to bigcartel or external shop
  let purchaseLink = bookUrl;
  $('a[href*="bigcartel"], a[href*="outofplacebooks"]').each((_, el) => {
    const href = $(el).attr("href") ?? "";
    if (href.startsWith("http") && href.includes("bigcartel")) {
      purchaseLink = href;
      return false;
    }
  });

  // Availability: check for "sold out" text or absence of a buy button
  const bodyText = $("body").text().toLowerCase();
  const hasBuyButton = $('a[href*="bigcartel"]').length > 0;
  const isSoldOut = bodyText.includes("sold out");
  const availability = isSoldOut || !hasBuyButton ? "sold out" : "available";

  const artistExists = await artistExistsInDb(artist);

  return {
    title,
    artist,
    artistExistsInDb: artistExists,
    description,
    coverUrl,
    images,
    availability,
    purchaseLink,
  };
}

async function main() {
  const outPath =
    process.argv[2] ??
    join(process.cwd(), "output", "outofplacebooks.csv");

  console.log("Fetching book URLs...");
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
