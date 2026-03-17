/**
 * Another Earth scraper
 * https://another-earth.com/books
 * Book pages: /Motherhouse, /a-narrow-foothold-jonas-feige-and-alan-huck, etc.
 * Title/artist: div[grid-col="2"] link text "Artist<br>Title"
 * Description: div[grid-col="3"]
 *
 * Run: npx tsx scripts/scrapers/another-earth.ts [output-path]
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

const BASE = "https://another-earth.com";
const BOOKS_INDEX_URL = `${BASE}/books`;

const FALLBACK_BOOK_PATHS = [
  "/Motherhouse",
  "/a-narrow-foothold-jonas-feige-and-alan-huck",
  "/what-makes-a-lake-book",
  "/Abbey-Meaker-Floodplains",
  "/Cristian-Ordonez-Displace",
];

function getBookUrlsFromIndex(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  $(`a[href*="${BASE}"], a[href^="/"]`).each((_, el) => {
    let href = $(el).attr("href");
    if (!href) return;
    href = href.trim();
    if (href.startsWith("/") && !href.startsWith("//")) {
      const path = href.split("?")[0];
      if (path === "/" || path === "/books" || path === "/menu-mobile") return;
      const full = normalizeUrl(href, BASE);
      if (!urls.includes(full)) urls.push(full);
    }
  });
  return urls;
}

async function scrapeBookPage(productUrl: string): Promise<{
  title: string;
  artist: string;
  artistExistsInDb: boolean;
  description: string;
  coverUrl: string;
  images: string;
  availability: string;
  purchaseLink: string;
}> {
  const html = await fetchHtml(productUrl);
  const $ = cheerio.load(html);

  let artist = "";
  let title = "";

  const $titleBlock = $('div[grid-col="2"]').first();
  const titleLinkText =
    $titleBlock.find("a.active, a[rel='history']").first().html() ??
    $titleBlock.html() ??
    "";
  const lines = titleLinkText
    .split(/<br\s*\/?>/i)
    .map((s) => cheerio.load(s).text().trim())
    .filter(Boolean);
  if (lines.length >= 2) {
    artist = lines[0];
    title = lines[1];
  } else if (lines.length === 1) {
    const commaIdx = lines[0].indexOf(", ");
    if (commaIdx > 0) {
      artist = lines[0].slice(0, commaIdx).trim();
      title = lines[0].slice(commaIdx + 2).trim();
    } else {
      title = lines[0];
    }
  }

  if (!title) {
    const ogTitle = $('meta[property="og:title"]').attr("content") ?? "";
    const cleaned = ogTitle.replace(/\s*[—–-]\s*Another Earth\s*$/i, "").trim();
    const commaIdx = cleaned.indexOf(", ");
    if (commaIdx > 0) {
      artist = artist || cleaned.slice(0, commaIdx).trim();
      title = cleaned.slice(commaIdx + 2).trim();
    } else {
      title = cleaned;
    }
  }

  let description = "";
  const $desc = $('div[grid-col="3"]').first();
  if ($desc.length) {
    let descHtml = $desc.html() ?? "";
    description = decodeHtmlEntities(descHtml)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>\s*/gi, "\n")
      .replace(/<p[^>]*>/gi, "\n")
      .replace(/<\/div>\s*/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/^\s+|\s+$/g, "")
      .trim();
  }
  if (!description) {
    description =
      $('meta[property="og:description"]').attr("content")?.trim() ?? "";
  }

  const ogImage = $('meta[property="og:image"]').attr("content");
  const coverUrl = ogImage ? normalizeUrl(ogImage, BASE) : "";

  const imageUrls: string[] = [];
  if (coverUrl) imageUrls.push(coverUrl);
  $("main img, [grid-col] img").each((_, el) => {
    const src = $(el).attr("src");
    if (src && !src.startsWith("data:") && !imageUrls.includes(src)) {
      imageUrls.push(normalizeUrl(src, BASE));
    }
  });
  const images = imageUrls.slice(1).join("|");

  const bodyLower = $.root().text().toLowerCase();
  const availability =
    bodyLower.includes("out of stock") || bodyLower.includes("sold out")
      ? "sold-out"
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
    purchaseLink: productUrl,
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "anotherearth-books.csv");

  let bookUrls: string[];

  try {
    console.log("Fetching books index...");
    const indexHtml = await fetchHtml(BOOKS_INDEX_URL);
    const fromIndex = getBookUrlsFromIndex(indexHtml);
    if (fromIndex.length > 0) {
      bookUrls = fromIndex;
      console.log(`Found ${bookUrls.length} book URLs from index.`);
    } else {
      bookUrls = FALLBACK_BOOK_PATHS.map((p) => `${BASE}${p}`);
      console.log("No links from index, using fallback list.");
    }
  } catch {
    bookUrls = FALLBACK_BOOK_PATHS.map((p) => `${BASE}${p}`);
    console.log("Index fetch failed, using fallback list.");
  }

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
      const row = await scrapeBookPage(url);
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
