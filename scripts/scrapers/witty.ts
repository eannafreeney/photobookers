/**
 * Witty Books scraper
 * https://witty-books.com/Books
 * Cargo CMS site — all book thumbnails are server-rendered in the listing page.
 *
 * title:        h1
 * artist:       h2
 * description:  body text after the <hr> divider on each product page
 * images:       data-src attrs on gallery images (original resolution)
 * availability: .tags a text on listing page ("Sold out" → sold_out, else available)
 * purchaseLink: canonical URL
 *
 * Run: npx tsx scripts/scrapers/witty.ts [output-path]
 */
import "../env";
import * as cheerio from "cheerio";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import {
  artistExistsInDb,
  decodeHtmlEntities,
  fetchHtml,
  rowToCsv,
} from "../scraperUtils";

const BASE = "https://witty-books.com";
const LISTING_URL = `${BASE}/Books`;
const LIMIT = 30;

interface ListingEntry {
  url: string;
  availability: string;
}

async function getBookEntries(): Promise<ListingEntry[]> {
  const html = await fetchHtml(LISTING_URL);
  const $ = cheerio.load(html);

  const entries: ListingEntry[] = [];

  $(".thumbnail").each((_, el) => {
    const href = $(el).find("a.image-link[href]").first().attr("href") ?? "";
    if (!href || href === "/") return;

    const full = href.startsWith("http") ? href : `${BASE}/${href.replace(/^\//, "")}`;

    // Availability from the tags block
    const tagText = $(el).find(".tags a").first().text().trim().toLowerCase();
    let availability = "available";
    if (tagText === "sold out") availability = "sold_out";
    else if (tagText === "last copies") availability = "available"; // still purchasable
    else if (tagText === "sale") availability = "available";

    if (!entries.find((e) => e.url === full)) {
      entries.push({ url: full, availability });
    }
  });

  return entries.slice(0, LIMIT);
}

function extractTextAfterHr($: cheerio.CheerioAPI): string {
  // The <hr> separates metadata from the book blurb
  const hr = $("hr").first();
  if (!hr.length) {
    // Fallback: grab all body text after the h2
    return "";
  }

  // Collect text from all siblings after the <hr>
  const parts: string[] = [];

  // hr is inside a grid-col div — walk its next siblings
  let node = hr[0].next;
  while (node) {
    if (node.type === "text") {
      const t = (node as unknown as { data: string }).data.trim();
      if (t) parts.push(t);
    } else if (node.type === "tag") {
      const tagName = (node as unknown as { name: string }).name;
      if (tagName === "br") {
        parts.push("\n");
      } else {
        const text = $(node as Parameters<typeof $>[0]).text().trim();
        if (text) parts.push(text);
      }
    }
    node = (node as { next: typeof node }).next;
  }

  return parts
    .join("")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

async function scrapeBookPage(
  entry: ListingEntry,
): Promise<{
  title: string;
  artist: string;
  artistExistsInDb: boolean;
  description: string;
  coverUrl: string;
  images: string;
  availability: string;
  purchaseLink: string;
}> {
  const html = await fetchHtml(entry.url);
  const $ = cheerio.load(html);

  const title = $("h1").first().text().trim();
  const artist = $("h2").first().text().trim();

  const description = decodeHtmlEntities(extractTextAfterHr($));

  // Collect all gallery images from slideshow and columns galleries.
  // Prefer data-src (original) over src (resized CDN). Skip cloned slides.
  const imageUrls: string[] = [];

  const addImage = (src: string) => {
    if (!src || src.startsWith("data:")) return;
    const full = src.startsWith("//") ? `https:${src}` : src;
    // Normalise to original quality
    const original = full.replace(/\/w\/\d+\/q\/\d+\//, "/t/original/");
    if (!imageUrls.includes(original)) imageUrls.push(original);
  };

  // Slideshow — skip slick clones (data-exclude-item)
  $(`.image-gallery[image-gallery="slideshow"] .gallery_card:not([data-exclude-item]) img`).each(
    (_, el) => {
      const dataSrc = $(el).attr("data-src") ?? "";
      const src = $(el).attr("src") ?? "";
      addImage(dataSrc || src);
    },
  );

  // Columns / secondary gallery
  $(`.image-gallery[image-gallery="columns"] img`).each((_, el) => {
    const dataSrc = $(el).attr("data-src") ?? "";
    const lazySrc = $(el).attr("data-lazy-src") ?? "";
    const src = $(el).attr("src") ?? "";
    addImage(dataSrc || lazySrc || src);
  });

  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  const purchaseLink =
    $('link[rel="canonical"]').attr("href")?.trim() || entry.url;

  const exists = artist ? await artistExistsInDb(artist) : false;

  return {
    title,
    artist,
    artistExistsInDb: exists,
    description,
    coverUrl,
    images,
    availability: entry.availability,
    purchaseLink,
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "witty.csv");

  console.log("Fetching book listing...");
  const entries = await getBookEntries();
  console.log(`Found ${entries.length} books (capped at ${LIMIT}).`);

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

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    console.log(`[${i + 1}/${entries.length}] ${entry.url}`);
    try {
      const row = await scrapeBookPage(entry);
      console.log(`  "${row.title}" by ${row.artist} — ${row.availability}`);
      lines.push(rowToCsv(row));
    } catch (err) {
      console.error(`  Error scraping ${entry.url}:`, err);
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
