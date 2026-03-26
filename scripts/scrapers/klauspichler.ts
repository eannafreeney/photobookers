/**
 * Klaus Pichler books scraper
 * Site: https://klauspichler.net
 *
 * Input URLs:
 * - https://klauspichler.net/book/
 * - Each URL starts with /book/
 *
 * CSV output columns (scripts/import.ts expects these):
 * - title
 * - artist
 * - artistExistsInDb
 * - description
 * - coverUrl
 * - images (gallery URLs separated by "|", excluding coverUrl)
 * - availability ("sold out" | "available")
 * - purchaseLink
 *
 * Run:
 *   npx tsx scripts/scrapers/klauspichler.ts output/klauspichler.csv 20
 */
import "../env";

import * as cheerio from "cheerio";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import {
  artistExistsInDb,
  fetchHtml,
  normalizeUrl,
  rowToCsv,
  decodeHtmlEntities,
} from "../scraperUtils";

const BASE = "https://klauspichler.net";
const COLLECTION_URL = `${BASE}/book/`;

function cleanWhitespace(s: string): string {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

function uniqPreserveOrder(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function getBookUrlsFromIndexHtml(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  const seen = new Set<string>();

  $('a[href^="/book/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    // Skip the index page itself
    if (href === "/book/" || href === "/book") return;

    const normalized = normalizeUrl(href.split("?")[0].trim(), BASE);
    if (!normalized.startsWith(`${BASE}/book/`)) return;

    // Only accept /book/<slug>/ pattern
    try {
      const pathname = new URL(normalized).pathname;
      if (!/^\/book\/[^/]+\/?$/.test(pathname)) return;
    } catch {
      return;
    }

    if (!seen.has(normalized)) {
      seen.add(normalized);
      urls.push(normalized);
    }
  });

  return uniqPreserveOrder(urls);
}

function getSliderImageUrls($: cheerio.CheerioAPI): string[] {
  const urls: string[] = [];

  // From your provided HTML: <img ... class="slider-img" ...>
  $("img.slider-img, .book-slider img").each((_, el) => {
    const src = $(el).attr("src");
    if (!src) return;

    const normalized = normalizeUrl(src.split("?")[0].trim(), BASE);
    if (!normalized.startsWith("http")) return;
    if (normalized.endsWith(".svg")) return;
    if (normalized.includes("data:")) return;

    urls.push(normalized);
  });

  return uniqPreserveOrder(urls);
}

async function scrapeBookPage(bookUrl: string): Promise<{
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

  const title = cleanWhitespace($("h1.entry-title").first().text());

  const artist = "Klaus Pichler";

  // Description = span with lang="en-US"
  // (join all spans in reading order)
  const spanTexts = $("span[lang='en-US']")
    .toArray()
    .map((el) => cleanWhitespace(decodeHtmlEntities($(el).text())))
    .filter(Boolean);

  const description =
    spanTexts.length > 0
      ? spanTexts.join("\n\n")
      : cleanWhitespace($("p").first().text());

  // Images from slider
  const sliderImages = getSliderImageUrls($);
  const coverUrl = sliderImages[0] ?? "";
  const images = sliderImages.slice(1).join("|");

  // Availability detection
  const bodyText = $("body").text().toLowerCase();
  const soldOut =
    bodyText.includes("sold out") ||
    bodyText.includes("soud out") ||
    bodyText.includes("out of stock");

  const availability = soldOut ? "sold out" : "available";

  // Purchase link: first external link in the payment note section
  let purchaseLink =
    $(".book-item__payment-note a.external-link")
      .first()
      .attr("href")
      ?.trim() ??
    $('link[rel="canonical"]').attr("href")?.trim() ??
    bookUrl;

  purchaseLink = purchaseLink.startsWith("http")
    ? purchaseLink
    : normalizeUrl(purchaseLink, BASE);

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
    process.argv[2] ?? join(process.cwd(), "output", "klauspichler.csv");
  const amount = process.argv[3] ? Math.max(0, Number(process.argv[3])) : 20;

  console.log(`Fetching collection: ${COLLECTION_URL}`);
  const collectionHtml = await fetchHtml(COLLECTION_URL);
  const urls = getBookUrlsFromIndexHtml(collectionHtml);

  const finalUrls = urls.slice(0, amount);
  console.log(
    `Found ${urls.length} book URLs. Scraping ${finalUrls.length}...`,
  );

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

  for (let i = 0; i < finalUrls.length; i++) {
    const url = finalUrls[i];
    console.log(`[${i + 1}/${finalUrls.length}] ${url}`);

    try {
      const row = await scrapeBookPage(url);
      lines.push(rowToCsv({ ...row }));
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
