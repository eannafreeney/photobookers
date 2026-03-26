/**
 
 * Run:
 *   npx tsx scripts/scrapers/chose-commune.ts output/chose-commune.csv 30
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

const BASE = "https://chosecommune.com";
const COLLECTION_URL = `${BASE}/book`;

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

/**
 * Pick the "first" URL from a srcset string.
 * e.g. "url1 960w, url2 2048w" -> "url1"
 */
function firstSrcFromSrcSet(srcset: string | undefined): string | null {
  if (!srcset) return null;
  const first = srcset.split(",")[0]?.trim();
  if (!first) return null;
  // remove trailing width descriptor
  return first.split(/\s+/)[0] ?? null;
}

function getBookUrlsFromCurrentTitlesHtml(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  const seen = new Set<string>();

  $('a[href^="/book/"]').each((_, el) => {
    const hrefRaw = $(el).attr("href");
    if (!hrefRaw) return;

    const pathOnly = hrefRaw.split("?")[0].trim();

    // Skip obvious non-book targets if they appear
    if (pathOnly === "/book/club/" || pathOnly === "/book/club") return;

    const normalized = normalizeUrl(pathOnly, BASE);

    try {
      const pathname = new URL(normalized).pathname;
      // Accept exactly: /book/<slug> (optionally trailing slash)
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

function getDescriptionFromProductHtml($: cheerio.CheerioAPI): string {
  const textIntro = $(".text-intro").first().text();

  const textSingleProductBlocks = $(".text-single-product")
    .toArray()
    .slice(0, 2)
    .map((el) => $(el).text());

  const parts = [textIntro, ...textSingleProductBlocks]
    .map((s) => cleanWhitespace(decodeHtmlEntities(s)))
    .filter(Boolean);

  return parts.join("\n\n").trim();
}

function getImagesFromProductHtml($: cheerio.CheerioAPI): {
  coverUrl: string;
  images: string;
} {
  // Prefer images that look like product visuals (not artist thumbnails).
  const $scope = $("main.content.aside-content").first().length
    ? $("main.content.aside-content").first()
    : $("body");

  const candidates: string[] = [];

  $scope
    .find("img.attachment-super-large, img.attachment-large, img.cover")
    .each((_, el) => {
      const $img = $(el);

      const src =
        ($img.attr("src") ?? "").trim() ||
        firstSrcFromSrcSet($img.attr("srcset") ?? undefined) ||
        firstSrcFromSrcSet($img.attr("data-srcset") ?? undefined) ||
        "";

      if (!src || src.startsWith("data:")) return;
      if (!src.includes("/wp-content/uploads/")) return;

      const normalized = normalizeUrl(src, BASE);
      candidates.push(normalized);
    });

  const unique = uniqPreserveOrder(candidates);
  const coverUrl = unique[0] ?? "";
  const images = unique.slice(1).join("|");

  return { coverUrl, images };
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

  const title = cleanWhitespace($("p.product-title").first().text());
  const artist = cleanWhitespace($("p.artist-name").first().text());

  const description = getDescriptionFromProductHtml($);

  const { coverUrl, images } = getImagesFromProductHtml($);

  // Availability: "out of stock" => sold out; otherwise available.
  const bodyLower = $("body").text().toLowerCase();
  const availability = bodyLower.includes("out of stock")
    ? "sold out"
    : "available";

  const purchaseLink =
    $('link[rel="canonical"]').attr("href")?.trim() ?? bookUrl;

  const artistExists = artist ? await artistExistsInDb(artist) : false;

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
  const outPath = process.argv[2] ?? join(process.cwd(), "output", "chose.csv");
  const amount = process.argv[3] ? Math.max(0, Number(process.argv[3])) : 30;

  console.log(`Fetching collection: ${COLLECTION_URL}`);
  const collectionHtml = await fetchHtml(COLLECTION_URL);
  const urls = getBookUrlsFromCurrentTitlesHtml(collectionHtml);

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
