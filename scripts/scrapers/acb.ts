/**
 * ACB Press scraper
 * Base: https://www.acb-press.com/publications
 * Publication pages: /publications/{slug}
 * Artist: route param after /publications/ (slug humanized)
 * Description: div.item.text
 *
 * Run: npx tsx scripts/scrapers/acbpress.ts [output-path]
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

const BASE = "https://www.acb-press.com";
const COLLECTION_URL = `${BASE}/publications`;

function slugToArtist(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function getArtistFromPublicationUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const match = path.match(/\/publications\/([^/]+)\/?$/);
    const slug = match ? match[1] : "";
    return slugToArtist(slug);
  } catch {
    return "";
  }
}

async function getPublicationUrls(collectionHtml: string): Promise<string[]> {
  const $ = cheerio.load(collectionHtml);
  const urls: string[] = [];
  $('a[href*="/publications/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const full = normalizeUrl(href.split("?")[0], BASE);
    const path = new URL(full).pathname;
    // only links that have a segment after /publications/
    if (!/\/publications\/[^/]+\/?$/.test(path)) return;
    if (!urls.includes(full)) urls.push(full);
  });
  return urls;
}

async function scrapePublication(pageUrl: string): Promise<{
  title: string;
  artist: string;
  artistExistsInDb: boolean;
  description: string;
  coverUrl: string;
  images: string;
  availability: string;
  purchaseLink: string;
}> {
  const html = await fetchHtml(pageUrl);
  const $ = cheerio.load(html);

  const artist = getArtistFromPublicationUrl(pageUrl);

  const title =
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]')
      .attr("content")
      ?.replace(/\s*[-|—]\s*ACB-PRESS\s*$/i, "")
      .replace(/\s*[-|—]\s*acb press\s*$/i, "")
      .trim() ||
    "";

  const description =
    $("div.item.text").first().text().trim() ||
    $('meta[name="description"]').attr("content")?.trim() ||
    "";

  // Gallery images: #assets .asset.image img (publication gallery only).
  // Use src or data-src so lazy-loaded images are included.
  function firstUrlFromSrcset(srcset: string | undefined): string | null {
    if (!srcset?.trim()) return null;
    const first = srcset.split(",")[0]?.trim();
    if (!first) return null;
    const url = first.split(/\s+/)[0]?.trim();
    return url && !url.startsWith("data:") ? url : null;
  }

  const imageUrls: string[] = [];
  $("#assets .asset.image img").each((_, el) => {
    const $el = $(el);
    const src =
      $el.attr("src") ||
      $el.attr("data-src") ||
      firstUrlFromSrcset($el.attr("data-srcset") || $el.attr("srcset"));
    if (src && !src.startsWith("data:")) {
      const full = normalizeUrl(src, BASE);
      if (!imageUrls.includes(full)) imageUrls.push(full);
    }
  });

  // Cover = first gallery image; images = rest. Fallback to og:image only when no gallery.
  const ogImage = $('meta[property="og:image"]').attr("content");
  const ogFull =
    ogImage && !ogImage.startsWith("data:") ? normalizeUrl(ogImage, BASE) : "";

  const coverUrl =
    imageUrls[0] ?? (ogFull && !imageUrls.includes(ogFull) ? ogFull : "");
  const images = imageUrls.slice(1).join("|");

  const purchaseLink =
    $('link[rel="canonical"]').attr("href")?.trim() || pageUrl;
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
    availability: "available",
    purchaseLink: finalPurchaseLink,
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "acbpress-books.csv");

  console.log("Fetching publications list...");
  const collectionHtml = await fetchHtml(COLLECTION_URL);
  const urls = await getPublicationUrls(collectionHtml);
  console.log(`Found ${urls.length} publication URLs`);

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
      const row = await scrapePublication(url);
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
