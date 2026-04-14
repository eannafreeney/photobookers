/**
 * Shift Books scraper
 * https://shiftbooks.de/en/collections/buecher
 * Shopify storefront.
 *
 * title:        h3 text, part after the first comma
 * artist:       h3 text, part before the first comma
 * description:  last p.p1 on the page (the book blurb)
 * images:       img.product-media__image in ul.media-gallery__grid
 * availability: "sold_out" if "sold out" badge present, else "available"
 * purchaseLink: canonical URL
 *
 * Run: npx tsx scripts/scrapers/shift.ts [output-path]
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

const BASE = "https://shiftbooks.de";
const COLLECTION_URL = `${BASE}/en/collections/buecher`;
const LIMIT = 30;

async function getBookUrls(): Promise<string[]> {
  const urls: string[] = [];
  let page = 1;

  while (urls.length < LIMIT) {
    const html = await fetchHtml(`${COLLECTION_URL}?page=${page}`);
    const $ = cheerio.load(html);

    const links: string[] = [];
    // Products link as plain anchors whose href contains /en/products/
    $(`a[href*="/en/products/"]`).each((_, el) => {
      const href = $(el).attr("href") ?? "";
      // Strip variant query param to get the canonical product URL
      const cleanHref = href.split("?")[0];
      const full = cleanHref.startsWith("http") ? cleanHref : `${BASE}${cleanHref}`;
      if (!links.includes(full)) links.push(full);
    });

    if (links.length === 0) break;

    for (const url of links) {
      if (!urls.includes(url)) urls.push(url);
      if (urls.length >= LIMIT) break;
    }

    page++;
  }

  return urls.slice(0, LIMIT);
}

async function scrapeBookPage(pageUrl: string): Promise<{
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

  // Title and artist from the h3 — format: "Artist, Title"
  const h3Text = $("h3").first().text().trim();
  const commaIdx = h3Text.indexOf(",");
  let artist = h3Text;
  let title = "";
  if (commaIdx !== -1) {
    artist = h3Text.slice(0, commaIdx).trim();
    title = h3Text.slice(commaIdx + 1).trim();
  }

  // Description — last p.p1 is the book blurb
  const $ps = $("p.p1");
  let description = "";
  if ($ps.length) {
    const raw = $ps.last().html() ?? "";
    description = decodeHtmlEntities(
      raw
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<p[^>]*>/gi, "")
        .replace(/<[^>]+>/g, ""),
    )
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .join("\n")
      .trim();
  }

  // Images from the desktop grid gallery
  const imageUrls: string[] = [];
  $("ul.media-gallery__grid img.product-media__image").each((_, el) => {
    const src = $(el).attr("src") ?? $(el).attr("data-src") ?? "";
    if (!src) return;
    // Strip Shopify width param and use a consistent large size
    const clean = src.replace(/&width=\d+/, "&width=1200").replace(/\?width=\d+/, "?width=1200");
    const full = normalizeUrl(clean, BASE);
    if (!imageUrls.includes(full)) imageUrls.push(full);
  });

  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  // Availability — look for sold-out indicator
  const pageText = $("body").text().toLowerCase();
  const hasSoldOut =
    $('[data-variant-available="false"]').length > 0 ||
    $(".sold-out, .badge--sold-out").length > 0 ||
    // The sticky add-to-cart exposes data-variant-available
    ($("sticky-add-to-cart").attr("data-variant-available") === "false");
  const availability = hasSoldOut ? "sold_out" : "available";

  const purchaseLink =
    $('link[rel="canonical"]').attr("href")?.trim() || pageUrl;

  const exists = artist ? await artistExistsInDb(artist) : false;

  return {
    title,
    artist,
    artistExistsInDb: exists,
    description,
    coverUrl,
    images,
    availability,
    purchaseLink,
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "shift.csv");

  console.log("Fetching book list...");
  const bookUrls = await getBookUrls();
  console.log(`Found ${bookUrls.length} books (capped at ${LIMIT}).`);

  const header = {
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
      console.log(`  "${row.title}" by ${row.artist} — ${row.availability}`);
      lines.push(rowToCsv(row));
    } catch (err) {
      console.error(`  Error scraping ${url}:`, err);
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
