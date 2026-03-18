/**
 * Witty Books scraper
 *
 * Source listing:
 * - Primary: https://witty-books.com/Books
 * - Fallback (if Books page is JS-rendered): https://witty-books.com/xxx-Aa-vv
 *
 * Per book page:
 * - title = first h1
 * - artist = first h2
 * - description = everything after </h2> inside the same parent block,
 *   with <br> / <br/> removed, tags stripped, whitespace normalized.
 *
 * Run:
 *   npx tsx scripts/scrapers/witty.ts [output-path]
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
const FALLBACK_BOOK_URL = `${BASE}/xxx-Aa-vv`;

const NON_BOOK_HREFS = new Set([
  // nav / pages
  "Books",
  "About",
  "Info",
  "Project",
  "Merch",
  "Cassettes",
  "Cassette",
  "Apparel",
  "Prints",
  "Special-edition",
  // footer / misc
  "contact-form",
  "Term-Conditions-Shipping",
  "shipping",
  "bookstores",
  "Education",
  // tag pages that appear in thumbnail tags
  "Sale",
  "sale",
  "Sold-out",
  "sold-out",
  "Last-copies",
  "last-copies",
  // not a book
  "previous-editions",
]);

function getBookUrlsFromHtml(html: string): string[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const urls: string[] = [];

  // The book grid is in the Thumbnail view in Cargo output
  $('[data-view="Thumbnail"] .thumbnail a.image-link[href]').each((_, el) => {
    const hrefRaw = $(el).attr("href")?.trim();
    if (!hrefRaw) return;

    const href = hrefRaw.split("?")[0].trim();
    if (!href || href.startsWith("#")) return;
    if (
      href.startsWith("mailto:") ||
      href.startsWith("javascript:") ||
      href.startsWith("http://") ||
      href.startsWith("https://")
    ) {
      // If they ever put absolute links here, only keep internal ones
      try {
        const u = new URL(href);
        if (u.origin !== BASE) return;
      } catch {
        return;
      }
    }

    // Filter known non-book routes
    const hrefNoLeadingSlash = href.replace(/^\//, "");
    if (NON_BOOK_HREFS.has(hrefNoLeadingSlash) || NON_BOOK_HREFS.has(href))
      return;

    const full = normalizeUrl(href, BASE);

    // Book URLs should be single-segment like /xxx-Aa-vv
    try {
      const path = new URL(full).pathname;
      const segments = path.split("/").filter(Boolean);
      if (segments.length !== 1) return;
    } catch {
      return;
    }

    if (!seen.has(full)) {
      seen.add(full);
      urls.push(full);
    }
  });

  return urls;
}

async function getAllBookUrls(): Promise<string[]> {
  console.log("Fetching books listing:", BOOKS_URL);
  const listingHtml = await fetchHtml(BOOKS_URL);
  let urls = getBookUrlsFromHtml(listingHtml);

  if (urls.length === 0) {
    console.log(
      "No thumbnail links on Books page; falling back to a book page for list:",
      FALLBACK_BOOK_URL,
    );
    const fallbackHtml = await fetchHtml(FALLBACK_BOOK_URL);
    urls = getBookUrlsFromHtml(fallbackHtml);
  }

  return urls;
}

function htmlToTextRemoveBr(html: string): string {
  // remove <br> / <br/> (replace with spaces)
  const noBr = html.replace(/<br\s*\/?>/gi, " ");
  return decodeHtmlEntities(noBr)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

  // Description = everything after </h2> in the same parent block
  let description = "";
  const h2 = $("h2").first();
  if (h2.length) {
    const parent = h2.parent();
    const parentHtml = parent.html() ?? "";
    const idx = parentHtml.toLowerCase().indexOf("</h2>");
    const afterH2 = idx >= 0 ? parentHtml.slice(idx + 5) : parentHtml;
    description = htmlToTextRemoveBr(afterH2);
  }

  // Cover: try og:image; if missing, grab first gallery image
  let coverUrl = normalizeUrl(
    $('meta[property="og:image"]').attr("content") ?? "",
    BASE,
  );

  if (!coverUrl) {
    const firstImg =
      $(".image-gallery img[data-src]").first().attr("data-src") ||
      $(".image-gallery img[src]").first().attr("src") ||
      "";
    coverUrl = normalizeUrl(firstImg, BASE);
  }

  // Images: collect unique gallery images (originals from data-src preferred)
  const imageUrls: string[] = [];
  $(".image-gallery img").each((_, el) => {
    const dataSrc = $(el).attr("data-src")?.trim();
    const src = $(el).attr("src")?.trim();
    const pick = (dataSrc || src || "").trim();
    if (!pick || pick.startsWith("data:")) return;
    const full = normalizeUrl(pick, BASE);
    if (!imageUrls.includes(full)) imageUrls.push(full);
  });

  // Ensure cover is first, remainder into `images` pipe-separated
  const unique = [...new Set(imageUrls)];
  if (coverUrl && unique.length && unique[0] !== coverUrl) {
    const idx = unique.indexOf(coverUrl);
    if (idx > 0) unique.splice(idx, 1);
    unique.unshift(coverUrl);
  } else if (!coverUrl && unique.length) {
    coverUrl = unique[0] ?? "";
  }
  const images = unique.slice(1).join("|");

  // Availability: use tags section if present
  const tagText = $('[data-view="Thumbnail"] .thumbnail.active .tags')
    .text()
    .toLowerCase();
  const pageText = $.root().text().toLowerCase();
  const availability =
    tagText.includes("sold out") ||
    pageText.includes("sold out") ||
    pageText.includes("out of stock")
      ? "sold out"
      : "available";

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
  const outPath = process.argv[2] ?? join(process.cwd(), "output", "witty.csv");

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
