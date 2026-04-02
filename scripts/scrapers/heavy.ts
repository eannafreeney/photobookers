/**
 * Heavy Books scraper
 * Site: https://www.heavybooks.net/
 * Product pages: /shop/p/<slug>
 *
 * Writes CSV with columns:
 * title, artist, artistExistsInDb, description, coverUrl, images, availability, purchaseLink
 *
 * Run:
 * npx tsx scripts/scrapers/heavybooks.ts output/heavybooks.csv [maxProducts]
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

const BASE = "https://www.heavybooks.net";
const SHOP_BOOKS_URL = `${BASE}/shop/books`;
const ARROW = "\u2192";

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

function textFromHtmlPreservingBr(html: string): string {
  // Convert <br> to newline, strip remaining tags, normalize whitespace.
  return decodeHtmlEntities(html ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}

function parseTitleArtistFromH1(rawH1: string): {
  title: string;
  artist: string;
} {
  const cleaned = (rawH1 ?? "").trim();
  if (!cleaned) return { title: "", artist: "" };

  // Example: "Morten Andenæs → Hvit stol. Mørkt rom."
  const m = cleaned.match(/^(.*?)\s+\\u2192\s+(.*)$/u);
  if (m) {
    return { artist: m[1].trim(), title: m[2].trim() };
  }

  // Fallback: try actual unicode arrow character as well (for safety)
  const m2 = cleaned.match(new RegExp(`^(.*?)\\s+${ARROW}\\s+(.*)$`));
  if (m2) {
    return { artist: m2[1].trim(), title: m2[2].trim() };
  }

  return { artist: "", title: cleaned };
}

function getAllProductUrlsFromListingHtml(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  const seen = new Set<string>();

  $('a[href*="/shop/p/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    const pathOnly = href.split("?")[0].trim();
    if (!pathOnly.startsWith("/shop/p/")) return;

    const full = normalizeUrl(pathOnly, BASE);
    if (seen.has(full)) return;
    seen.add(full);
    urls.push(full);
  });

  return urls;
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

  const rawH1 = $("h1.product-title").first().text().trim();
  let { title, artist } = parseTitleArtistFromH1(rawH1);

  if (!title) {
    // Fallback: sometimes the listing/metadata is all we have
    const ogTitle = $('meta[property="og:title"]').attr("content") ?? "";
    // og:title might look like "Morten Andenæs — Heavy Books" (not ideal to parse artist/title)
    title = ogTitle.trim();
  }

  // Description: use the product description block which contains the <br>-separated metadata.
  const descP = $("div.product-description p").toArray();
  let description = "";
  if (descP.length > 0) {
    const candidates = descP
      .map((p) => textFromHtmlPreservingBr($(p).html() ?? ""))
      .filter((s) => s.length > 0);

    // Prefer the longest candidate (there are often multiple blocks for responsive layouts).
    description = candidates.sort((a, b) => b.length - a.length)[0] ?? "";
  }

  // Images: only from product gallery area to avoid picking up random site images/icons.
  const imageUrls: string[] = [];
  const galleryRoot = $(".product-gallery");
  const rootForImgs = galleryRoot.length ? galleryRoot : $.root();

  rootForImgs.find("img").each((_, el) => {
    const $el = $(el);
    const src =
      $el.attr("data-image") ?? $el.attr("data-src") ?? $el.attr("src") ?? "";

    if (!src) return;
    if (src.startsWith("data:")) return;

    // Keep only Squarespace CDN "content" images (covers + interior pages).
    if (!src.includes("images.squarespace-cdn.com/content/")) return;

    const normalized = normalizeUrl(src, BASE);
    if (!normalized) return;
    imageUrls.push(normalized);
  });

  const uniqueImages = uniqPreserveOrder(imageUrls);
  const coverUrl = uniqueImages[0] ?? "";
  const images = uniqueImages.slice(1).join("|");

  // Availability: prefer structured meta, fallback to body text.
  const availabilityMeta = $('meta[property="product:availability"]')
    .attr("content")
    ?.toLowerCase();
  let availability = "available";
  if (availabilityMeta) {
    availability = availabilityMeta.includes("instock")
      ? "available"
      : "sold out";
  } else {
    const bodyText = $("body").text().toLowerCase();
    availability = bodyText.includes("sold out") ? "sold out" : "available";
  }

  const canonical = $("link[rel='canonical']").attr("href")?.trim();
  const purchaseLink = canonical ? canonical : productUrl;

  const artistExists =
    artist && artist.trim() ? await artistExistsInDb(artist) : false;

  return {
    title: title.trim(),
    artist: artist.trim(),
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
    process.argv[2] ?? join(process.cwd(), "output", "heavybooks.csv");

  const maxProductsArg = process.argv[3];
  const maxProducts = maxProductsArg
    ? Math.max(0, Number(maxProductsArg))
    : Infinity;

  console.log(`Fetching listing: ${SHOP_BOOKS_URL}`);
  const listingHtml = await fetchHtml(SHOP_BOOKS_URL);
  const productUrls = getAllProductUrlsFromListingHtml(listingHtml);

  const finalUrls = productUrls.slice(0, maxProducts);
  console.log(
    `Found ${productUrls.length} product URLs. Scraping ${finalUrls.length}...`,
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
      const row = await scrapeProduct(url);
      lines.push(rowToCsv(row));
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
