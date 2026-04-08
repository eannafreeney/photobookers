/**
 * Case Publishing scraper
 * https://case-publishing.jp/en/publications
 * Book pages: /en/publication/the-hawk-and-the-tall-tree, etc.
 * Title: h1.item-header__title
 * Artist: .item-header__artist
 * Description: .details + .text
 *
 * Run: npx tsx scripts/scrapers/case-publishing.ts [output-path]
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

const BASE = "https://case-publishing.jp";
const INDEX_URL = `${BASE}/en/publications`;

function extractBookUrlsFromIndex(html: string): {
  urls: string[];
  nextPage: string | null;
} {
  const $ = cheerio.load(html);
  const urls: string[] = [];

  $('a[href*="/en/publication/"]').each((_, el) => {
    const href = $(el).attr("href")?.trim();
    if (!href) return;
    const full = normalizeUrl(href, BASE).split("?")[0];
    if (full.includes("/en/publication/") && !urls.includes(full)) {
      urls.push(full);
    }
  });

  let nextPage: string | null = null;
  $("a[href]").each((_, el) => {
    if (nextPage) return;
    const text = $(el).text().trim().toLowerCase();
    const href = $(el).attr("href")?.trim();
    if (!href) return;
    if (text === "next page" || text.includes("next page")) {
      nextPage = normalizeUrl(href, BASE);
    }
  });

  return { urls, nextPage };
}

function htmlToText(html: string): string {
  return decodeHtmlEntities(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*/gi, "\n")
    .replace(/<p[^>]*>/gi, "\n")
    .replace(/<\/div>\s*/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/^\s+|\s+$/g, "")
    .trim();
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

  const title =
    $("h1.item-header__title").first().text().trim() ||
    $('meta[property="og:title"]')
      .attr("content")
      ?.replace(/\s*\|.*$/, "")
      .trim() ||
    "";

  const artist = $(".item-header__artist").first().text().trim();

  const detailsHtml = $(".details").first().html() ?? "";
  const textHtml = $(".text").first().html() ?? "";
  let description = [htmlToText(detailsHtml), htmlToText(textHtml)]
    .filter(Boolean)
    .join("\n\n")
    .trim();

  if (!description) {
    description =
      $('meta[property="og:description"]').attr("content")?.trim() ?? "";
  }

  const galleryUrls: string[] = [];
  $("#item-gallery img").each((_, el) => {
    const src = $(el).attr("src");
    if (!src || src.startsWith("data:")) return;
    galleryUrls.push(normalizeUrl(src, BASE));
  });

  const coverUrl = galleryUrls[0] ?? "";
  const rest = galleryUrls.slice(1);
  const seen = new Set<string>();
  const uniqueRest: string[] = [];
  for (const u of rest) {
    if (!seen.has(u)) {
      seen.add(u);
      uniqueRest.push(u);
    }
  }
  const images = uniqueRest.join("|");

  const bodyLower = $.root().text().toLowerCase();
  const availability =
    bodyLower.includes("sold out") || bodyLower.includes("out of stock")
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

async function collectAllBookUrls(
  startUrl: string,
  maxPages = 20,
): Promise<string[]> {
  const allUrls: string[] = [];
  let nextUrl: string | null = startUrl;
  let pageCount = 0;

  while (nextUrl && pageCount < maxPages) {
    pageCount += 1;
    console.log(`Fetching index page ${pageCount}: ${nextUrl}`);
    const html = await fetchHtml(nextUrl);
    const { urls, nextPage } = extractBookUrlsFromIndex(html);

    for (const u of urls) {
      if (!allUrls.includes(u)) allUrls.push(u);
    }

    nextUrl = nextPage;
  }

  return allUrls;
}

async function main() {
  const outPath =
    process.argv[2] ??
    join(process.cwd(), "output", "case-publishing-books.csv");

  const bookUrls = await collectAllBookUrls(INDEX_URL);
  console.log(`Found ${bookUrls.length} book URLs`);

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
