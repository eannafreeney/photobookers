/**
 * Simon Roberts shop scraper (WordPress Shopp)
 * Catalog: https://www.simoncroberts.com/shop/
 * Product pages: /shop/{slug}/
 *
 * All items are by Simon Roberts. Description and gallery come from each product page.
 *
 * Run: npx tsx scripts/scrapers/simon-roberts.ts [output-path]
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

const BASE = "https://www.simoncroberts.com";
const SHOP_URL = `${BASE}/shop/`;
const ARTIST = "Simon Roberts";

function cleanText(s: string): string {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

function getProductUrlsFromShop(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];

  $(".products .product h3.name a[href]").each((_, el) => {
    const href = $(el).attr("href")?.trim();
    if (!href || href.includes("/shop/cart")) return;
    const full = normalizeUrl(href.split("?")[0], BASE);
    if (!full.includes("/shop/") || full === SHOP_URL) return;
    if (!urls.includes(full)) urls.push(full);
  });

  return urls;
}

function parseSlideImages($: cheerio.CheerioAPI): string[] {
  const raw = $("#product-slideshow").attr("data-slides");
  if (!raw) return [];

  try {
    const slides = JSON.parse(decodeHtmlEntities(raw)) as Array<{ src?: string }>;
    const urls: string[] = [];
    for (const slide of slides) {
      if (typeof slide.src !== "string" || !slide.src.trim()) continue;
      const full = normalizeUrl(slide.src, BASE);
      if (!urls.includes(full)) urls.push(full);
    }
    return urls;
  } catch {
    return [];
  }
}

function getImageUrls($: cheerio.CheerioAPI): string[] {
  const fromSlides = parseSlideImages($);
  if (fromSlides.length > 0) return fromSlides;

  const urls: string[] = [];
  $("#productgallery img, .product img").each((_, el) => {
    const src = $(el).attr("src");
    if (!src || src.startsWith("data:")) return;
    const full = normalizeUrl(src, BASE);
    if (!urls.includes(full)) urls.push(full);
  });

  const ogImage = $('meta[property="og:image"]').attr("content");
  if (ogImage && !ogImage.startsWith("data:")) {
    const full = normalizeUrl(ogImage, BASE);
    if (!urls.includes(full)) urls.push(full);
  }

  return urls;
}

function getAvailability($: cheerio.CheerioAPI): "sold-out" | "available" {
  const boxText = cleanText($("#productboxes").text());
  if (/sold\s*out/i.test(boxText)) return "sold-out";
  if (/price\s+on\s+request/i.test(boxText)) return "available";

  const hasAddToCart =
    $('form.shopp.product input.addtocart, form.shopp.product input[name="addtocart"]')
      .length > 0;
  return hasAddToCart ? "available" : "sold-out";
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
    cleanText($("h3.productname").first().text()) ||
    cleanText(
      $('meta[property="og:title"]')
        .attr("content")
        ?.replace(/\s*[-–]\s*Simon Roberts\s*$/i, "") ?? "",
    ) ||
    cleanText($("h3.name a").first().text());

  const $desc = $("#productdesc").clone();
  $desc.find("h3.productname, .addthis_toolbox, script, style").remove();
  let description =
    cleanText($desc.text()) ||
    cleanText(decodeHtmlEntities($('meta[property="og:description"]').attr("content") ?? ""));
  if (title && description.toLowerCase().startsWith(title.toLowerCase())) {
    description = cleanText(description.slice(title.length));
  }

  const imageUrls = getImageUrls($);
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  const availability = getAvailability($);
  const purchaseLink =
    cleanText($('link[rel="canonical"]').attr("href") ?? "") ||
    cleanText($('meta[property="og:url"]').attr("content") ?? "") ||
    productUrl;

  const artistExists = await artistExistsInDb(ARTIST);

  return {
    title,
    artist: ARTIST,
    artistExistsInDb: artistExists,
    description,
    coverUrl,
    images,
    availability,
    purchaseLink: purchaseLink.startsWith("http")
      ? purchaseLink
      : normalizeUrl(purchaseLink, BASE),
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "simon-roberts.csv");

  console.log(`Fetching shop catalog: ${SHOP_URL}`);
  const shopHtml = await fetchHtml(SHOP_URL);
  const urls = getProductUrlsFromShop(shopHtml);
  console.log(`Found ${urls.length} product URLs`);

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
