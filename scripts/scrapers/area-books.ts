/**
 * Area Books scraper
 * https://area-books.com/en
 * Book pages: /en/{slug} (linked from the /en index, excluding /en/about)
 * Title/artist: h1.show-xs -> "Title by Artist"
 * Description: .text-book blocks; specs: .info-content; credits: .credits-book
 * Images: .diaporama img (cover = og:image)
 *
 * Run: npx tsx scripts/scrapers/area-books.ts [output-path]
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

const BASE = "https://area-books.com";
const INDEX_URL = `${BASE}/en`;

// Non-book pages that live under /en/
const EXCLUDE_SLUGS = new Set(["about", "contact", "news", "shop", "cart"]);

function getBookUrlsFromIndex(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  $('a[href*="/en/"]').each((_, el) => {
    let href = $(el).attr("href");
    if (!href) return;
    href = href.trim().split("?")[0].split("#")[0].replace(/\/$/, "");
    const m = href.match(/\/en\/([a-z0-9-]+)$/i);
    if (!m) return;
    if (EXCLUDE_SLUGS.has(m[1].toLowerCase())) return;
    const full = normalizeUrl(href, BASE);
    if (!urls.includes(full)) urls.push(full);
  });
  return urls;
}

/** Dedupe an ordered list of strings, keeping first occurrence. */
function uniq(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const i of items) {
    const key = i.trim();
    if (key && !seen.has(key)) {
      seen.add(key);
      out.push(key);
    }
  }
  return out;
}

function cleanText(s: string): string {
  return s
    .replace(/ /g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function scrapeBookPage(productUrl: string): Promise<{
  title: string;
  artist: string;
  artistExistsInDb: boolean;
  description: string;
  coverUrl: string;
  images: string;
  availability: string;
  purchaseLink: string;
} | null> {
  const html = await fetchHtml(productUrl);
  const $ = cheerio.load(html);

  // Not every /en/ link is a book (e.g. terms pages) — a real book has .book + h1.show-xs
  const heading = $("h1.show-xs").first().text().replace(/\s+/g, " ").trim();
  if ($(".book").length === 0 || !heading) return null;

  // Title / artist: "Title by Artist"
  let title = heading;
  let artist = "";
  const byIdx = heading.toLowerCase().indexOf(" by ");
  if (byIdx > 0) {
    title = heading.slice(0, byIdx).trim();
    artist = heading.slice(byIdx + 4).trim();
  }

  // Description: unique .text-book paragraphs (page duplicates hide-xs/show-xs)
  const descParts = uniq(
    $(".text-book")
      .map((_, el) => cleanText($(el).text()))
      .get()
      .filter((t) => t.length > 30),
  );

  // Specs (format, dimensions, print run, date). .info-content is a repeating
  // ticker whose copies are separated by .spacer divs — keep the first segment.
  const infoHtml = $(".info-content").first().html() ?? "";
  const specs = cleanText(
    cheerio.load(infoHtml.split(/<div class="spacer">/i)[0]).text(),
  );

  // Credits (images / text / design / support)
  const credits: string[] = [];
  $(".credits-book").each((_, el) => {
    const label = cleanText($(el).find(".title-credits").first().text());
    const body = cleanText($(el).find(".text-credits").first().text());
    if (body) credits.push(label ? `${label}: ${body}` : body);
  });

  const description = cleanText(
    [specs, descParts.join("\n\n"), uniq(credits).join("\n")]
      .filter(Boolean)
      .join("\n\n"),
  );

  // Images: cover from og:image, gallery from the diaporama carousel
  const ogImage = $('meta[property="og:image"]').attr("content");
  const imageUrls: string[] = [];
  if (ogImage) imageUrls.push(normalizeUrl(ogImage, BASE));
  $(".diaporama img").each((_, el) => {
    const src = $(el).attr("data-src") || $(el).attr("src");
    if (src && !src.startsWith("data:")) {
      const full = normalizeUrl(src, BASE);
      if (!imageUrls.includes(full)) imageUrls.push(full);
    }
  });
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  const artistExists = artist ? await artistExistsInDb(artist) : false;

  return {
    title,
    artist,
    artistExistsInDb: artistExists,
    description,
    coverUrl,
    images,
    availability: "available",
    purchaseLink: productUrl,
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "area-books.csv");

  console.log("Fetching books index...");
  const indexHtml = await fetchHtml(INDEX_URL);
  const bookUrls = getBookUrlsFromIndex(indexHtml);
  console.log(`Found ${bookUrls.length} book URLs from index.`);

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

  for (let i = 0; i < bookUrls.length; i++) {
    const url = bookUrls[i];
    console.log(`[${i + 1}/${bookUrls.length}] ${url}`);
    try {
      const row = await scrapeBookPage(url);
      if (!row) {
        console.log("  skipped (not a book page)");
        continue;
      }
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
