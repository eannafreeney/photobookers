/**
 * Disko Bay Publishing scraper
 * Base: https://www.diskobay.org/
 * Book pages: /books/{slug}/
 * h1.book-title: artist = text before <br>, title = text in <i>
 * Description: .text.col8.push2 | Images: .gallery-item (max 7) | Publisher: diskobay
 *
 * Run: npx tsx scripts/scrapers/diskobay.ts [output-path]
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
} from "../scraperUtils";

const BASE = "https://www.diskobay.org";
const COLLECTION_URL = BASE + "/";
const MAX_IMAGES = 7;

function getBookUrlsFromHome(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  $('a[href*="/books/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const path = href.split("?")[0].trim();
    if (!/\/books\/[^/]+\/?$/.test(path)) return;
    const full = normalizeUrl(path.replace(/\/$/, "") || path, BASE);
    if (!urls.includes(full)) urls.push(full);
  });
  return urls;
}

function getImageUrls($: cheerio.CheerioAPI): string[] {
  const imageUrls: string[] = [];
  $(".gallery-item img").each((_, el) => {
    const $el = $(el);
    const src =
      $el.attr("src") ||
      $el.attr("data-src") ||
      $el.attr("data-srcset")?.split(/\s+/)[0];
    if (src && !src.startsWith("data:")) {
      const full = normalizeUrl(src, BASE);
      if (!imageUrls.includes(full)) imageUrls.push(full);
    }
  });
  $(".gallery-item a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (
      href &&
      /\.(jpe?g|png|webp|gif)(\?|$)/i.test(href) &&
      !href.startsWith("data:")
    ) {
      const full = normalizeUrl(href, BASE);
      if (!imageUrls.includes(full)) imageUrls.push(full);
    }
  });
  if (imageUrls.length === 0) {
    const ogImage = $('meta[property="og:image"]').attr("content");
    if (ogImage && !ogImage.startsWith("data:")) {
      imageUrls.push(normalizeUrl(ogImage, BASE));
    }
  }
  return imageUrls.slice(0, MAX_IMAGES);
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

  const $titleBlock = $("h1.book-title").first();
  const htmlContent = $titleBlock.html() || "";
  const artist = $titleBlock
    .clone()
    .children("br,i")
    .remove()
    .end()
    .text()
    .trim();
  const title =
    $titleBlock.find("i").first().text().trim() ||
    $titleBlock.text().replace(artist, "").replace(/\s+/g, " ").trim() ||
    "";

  const description =
    $(".text.col8.push2").first().text().trim() ||
    $('meta[name="description"]').attr("content")?.trim() ||
    "";

  const imageUrls = getImageUrls($);
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  const $body = $("body");
  const isSoldOut =
    $body.text().toLowerCase().includes("sold out") ||
    $body.text().toLowerCase().includes("out of stock");
  const availability = isSoldOut ? "sold-out" : "available";

  const purchaseLink =
    $('link[rel="canonical"]').attr("href")?.trim() ||
    $('meta[property="og:url"]').attr("content")?.trim() ||
    bookUrl;
  const finalPurchaseLink = purchaseLink.startsWith("http")
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
    purchaseLink: finalPurchaseLink,
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "diskobay-books.csv");

  console.log("Fetching homepage...");
  const homeHtml = await fetchHtml(COLLECTION_URL);
  const urls = getBookUrlsFromHome(homeHtml);
  console.log(`Found ${urls.length} book URLs`);

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

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`[${i + 1}/${urls.length}] ${url}`);
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
