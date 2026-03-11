/**
 * RVB Books scraper (Shopify)
 * Catalog: https://rvb-books.com/collections/catalog
 * Product: title = h1, artist = h2, description = .split-1 + .split-2
 *
 * Run: npx tsx scripts/scrapers/rvbbooks.ts [output-path]
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

const BASE = "https://rvb-books.com";
const COLLECTION_BASE = `${BASE}/collections/catalog`;
const MAX_EXTRA_IMAGES = 5;

function getProductUrlsFromHtml(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  $('a[href*="/products/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      const path = href.split("?")[0].trim();
      if (!/\/products\/[^/]+/.test(path)) return;
      const full = normalizeUrl(path, BASE);
      if (!urls.includes(full)) urls.push(full);
    }
  });
  return urls;
}

async function getAllProductUrls(): Promise<string[]> {
  const seen = new Set<string>();
  const all: string[] = [];
  let page = 1;

  for (;;) {
    const url =
      page === 1 ? COLLECTION_BASE : `${COLLECTION_BASE}?page=${page}`;
    console.log(`Fetching collection page ${page}: ${url}`);
    const html = await fetchHtml(url);
    const urls = getProductUrlsFromHtml(html);
    if (urls.length === 0) break;
    let added = 0;
    for (const u of urls) {
      if (!seen.has(u)) {
        seen.add(u);
        all.push(u);
        added++;
      }
    }
    if (added === 0) break;
    page++;
  }

  return all;
}

function getTextFromEl($: cheerio.CheerioAPI, el: cheerio.Element): string {
  const html = $(el).html() ?? "";
  let text = decodeHtmlEntities(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*/gi, "\n")
    .replace(/<\/li>\s*/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text;
}

async function scrapeProduct(productUrl: string): Promise<{
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
    $(".book__form h1").first().text().trim() ||
    $("main h1").first().text().trim() ||
    $("h1").first().text().trim() ||
    "";

  const artist =
    $(".book__form h2").first().text().trim() ||
    $("main h2").first().text().trim() ||
    $("h2").first().text().trim() ||
    "";

  const parts: string[] = [];
  $(".book__description .split.split-1 ul li, .split-1 ul li").each((_, el) => {
    const t = $(el).text().trim();
    if (t) parts.push(t);
  });
  if (parts.length > 0) {
    parts.push("");
  }
  $(".book__description .split.split-2 p, .split-2 p").each((_, el) => {
    const t = getTextFromEl($, el);
    if (t) parts.push(t);
  });
  let description = parts.join("\n").trim();
  if (!description) {
    const split1 = $(".split-1").first();
    const split2 = $(".split-2").first();
    if (split1.length) description = getTextFromEl($, split1.get(0)!);
    const d2 = split2.length ? getTextFromEl($, split2.get(0)!) : "";
    if (d2) description = description ? `${description}\n\n${d2}` : d2;
  }
  if (!description) {
    const ld = $('script[type="application/ld+json"]').first().html();
    if (ld) {
      try {
        const data = JSON.parse(ld) as { description?: string };
        if (data.description) description = data.description;
      } catch {
        // ignore
      }
    }
  }

  const imageUrls: string[] = [];
  $(".slideshow__figure img.slideshow__image, .slideshow__image").each(
    (_, el) => {
      const src =
        $(el).attr("data-src") ||
        $(el).attr("srcset")?.split(/\s+/)?.[0] ||
        $(el).attr("src");
      if (src && !src.startsWith("data:")) {
        const u = src.split(" ")[0].trim();
        const full = normalizeUrl(u, BASE);
        if (!imageUrls.includes(full)) imageUrls.push(full);
      }
    },
  );
  if (imageUrls.length === 0) {
    const og = $('meta[property="og:image"]').attr("content");
    if (og && !og.startsWith("data:")) {
      imageUrls.push(normalizeUrl(og, BASE));
    }
  }
  const uniqueImages = [...new Set(imageUrls)];
  const coverUrl = uniqueImages[0] ?? "";
  const images = uniqueImages.slice(1, 1 + MAX_EXTRA_IMAGES).join("|");

  const purchaseLink =
    $('link[rel="canonical"]').attr("href")?.trim() ||
    $('meta[property="og:url"]').attr("content")?.trim() ||
    productUrl;
  const finalPurchaseLink = purchaseLink.startsWith("http")
    ? purchaseLink
    : normalizeUrl(purchaseLink, BASE);

  const soldOut =
    $("#AddToCart[data-soldout]").attr("data-soldout") === "Sold out" ||
    $("body").text().toLowerCase().includes("sold out");
  const availability = soldOut ? "sold-out" : "available";

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
    process.argv[2] ?? join(process.cwd(), "output", "rvb-books.csv");

  console.log("Fetching product URLs from catalog (all pages)...");
  const productUrls = await getAllProductUrls();
  console.log(`Found ${productUrls.length} product URLs`);

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

  for (let i = 0; i < productUrls.length; i++) {
    const url = productUrls[i];
    console.log(`[${i + 1}/${productUrls.length}] ${url}`);
    try {
      const row = await scrapeProduct(url);
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
