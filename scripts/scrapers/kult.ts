/**
 * Kult Books scraper (Squarespace)
 * https://kultbooks.com/
 * Book pages: /books/{slug}
 * Title = first h1, artist = second h1 in .sqs-html-content
 * Description = text from p inside .sqs-html-content blocks
 *
 * Run: npx tsx scripts/scrapers/kultbooks.ts [output-path]
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

const BASE = "https://kultbooks.com";
const INDEX_URLS = [
  BASE + "/",
  BASE + "/books/available",
  BASE + "/books/low-in-stock",
  BASE + "/books/sold-out",
  BASE + "/books/rare",
];
const MAX_IMAGES = 7;
const BOOK_PATH_REG = /^\/books\/([^/]+)$/;

function getBookUrlsFromHtml(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  $('a[href*="/books/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const path = href.split("?")[0].trim().replace(/\/$/, "") || "/";
    const match = path.match(BOOK_PATH_REG);
    if (!match) return;
    const slug = match[1];
    if (["available", "sold-out", "low-in-stock", "rare"].includes(slug))
      return;
    const full = `${BASE}/books/${slug}`;
    if (!urls.includes(full)) urls.push(full);
  });
  return urls;
}

function getImageUrls($: cheerio.CheerioAPI): string[] {
  const imageUrls: string[] = [];
  $(
    ".sqs-gallery img[data-image], .sqs-gallery img[data-src], .sqs-block-gallery img[data-image], .slide img[data-image]",
  ).each((_, el) => {
    const url =
      $(el).attr("data-image") || $(el).attr("data-src") || $(el).attr("src");
    if (url && !url.startsWith("data:")) {
      const full = url.startsWith("http") ? url : normalizeUrl(url, BASE);
      if (!imageUrls.includes(full)) imageUrls.push(full);
    }
  });
  if (imageUrls.length === 0) {
    $(".sqs-gallery img[src], .slide img[src]").each((_, el) => {
      const src = $(el).attr("src");
      if (src && !src.startsWith("data:")) {
        const full = normalizeUrl(src, BASE);
        if (!imageUrls.includes(full)) imageUrls.push(full);
      }
    });
  }
  if (imageUrls.length === 0) {
    const og = $('meta[property="og:image"]').attr("content");
    if (og) imageUrls.push(normalizeUrl(og, BASE));
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

  let title = "";
  let artist = "";
  $(".sqs-html-content").each((_, blockEl) => {
    const $block = $(blockEl);
    const h1s = $block.find("h1");
    if (h1s.length >= 2) {
      title = decodeHtmlEntities($(h1s[0]).text().trim());
      artist = decodeHtmlEntities($(h1s[1]).text().trim());
      return false;
    }
  });
  if (!title && !artist) {
    const h1s = $("h1");
    if (h1s.length >= 1) title = $(h1s[0]).text().trim();
    if (h1s.length >= 2) artist = $(h1s[1]).text().trim();
  }

  const descParts: string[] = [];
  $(".sqs-html-content").each((_, blockEl) => {
    const $block = $(blockEl);
    if ($block.find("h1").length >= 2) return;
    $block.find("p").each((_, pEl) => {
      const html = $(pEl).html() ?? "";
      const text = decodeHtmlEntities(html)
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/[ \t]+/g, " ")
        .trim();
      if (text) descParts.push(text);
    });
  });
  const description = descParts.join("\n\n").trim();

  const imageUrls = getImageUrls($);
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  let availability = "available";
  const productEl = $(".product-block[data-product], [data-product]").first();
  const productJson = productEl.attr("data-product");
  if (productJson) {
    try {
      const data = JSON.parse(productJson) as { soldOut?: boolean };
      if (data.soldOut === true) availability = "sold-out";
    } catch {
      // ignore
    }
  }
  if (
    availability === "available" &&
    $("body").text().toLowerCase().includes("sold out")
  ) {
    const $btn = $(".sqs-add-to-cart-button, [data-product]");
    if ($btn.text().toLowerCase().includes("sold out"))
      availability = "sold-out";
  }

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
    process.argv[2] ?? join(process.cwd(), "output", "kultbooks-books.csv");

  const seen = new Set<string>();
  const urls: string[] = [];
  for (const indexUrl of INDEX_URLS) {
    try {
      console.log("Fetching index:", indexUrl);
      const html = await fetchHtml(indexUrl);
      const pageUrls = getBookUrlsFromHtml(html);
      for (const u of pageUrls) {
        if (!seen.has(u)) {
          seen.add(u);
          urls.push(u);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch index:", indexUrl, err);
    }
  }

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
