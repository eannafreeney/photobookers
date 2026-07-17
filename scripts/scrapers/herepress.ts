/**
 * Here Press scraper
 * https://herepress.org/books-prints/
 * Book pages: /books-prints/{slug}/
 * Title/artist: .text.meta p.title -> "Artist<br>'Title'"
 * Description: .text (non-meta) + .text.meta specs paragraphs
 * Images: img[data-flickity-lazyload] (lazy-loaded slider)
 *
 * Run: npx tsx scripts/scrapers/herepress.ts [output-path]
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

const BASE = "https://herepress.org";
const INDEX_URL = `${BASE}/books-prints/`;

function getBookUrlsFromIndex(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  $('a[href^="/books-prints/"], a[href^="' + BASE + '/books-prints/"]').each(
    (_, el) => {
      let href = $(el).attr("href");
      if (!href) return;
      href = href.trim().split("?")[0].split("#")[0];
      const path = href.replace(BASE, "");
      // Skip the index page itself; keep only individual book slugs
      if (path === "/books-prints/" || path === "/books-prints") return;
      const full = normalizeUrl(path, BASE);
      if (!urls.includes(full)) urls.push(full);
    },
  );
  return urls;
}

/** Strip surrounding straight/curly quotes from a title. */
function stripQuotes(s: string): string {
  return s.replace(/^['"‘’“”]+|['"‘’“”]+$/g, "").trim();
}

/** Collapse a cheerio-extracted block of HTML into clean multi-line text. */
function htmlToText($: cheerio.CheerioAPI, el: cheerio.Cheerio<any>): string {
  const html = el.html() ?? "";
  const text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*/gi, "\n\n")
    .replace(/<p[^>]*>/gi, "");
  return cheerio
    .load(text)
    .text()
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
}> {
  const html = await fetchHtml(productUrl);
  const $ = cheerio.load(html);

  // Title / artist: p.title inside the meta column -> "Artist<br>'Title'".
  // Some (newer, Sanity-templated) pages nest a stray <p> inside p.title, which
  // cheerio auto-closes — the real text then lands in the next sibling <p>.
  const titleEl = $(".text.meta p.title").first();
  const titleHtml = (
    titleEl.text().trim() ? titleEl.html() : titleEl.next("p").html()
  ) ?? "";
  const titleLines = titleHtml
    .split(/<br\s*\/?>/i)
    .map((s) => cheerio.load(s).text().trim())
    .filter(Boolean);

  let artist = "";
  let title = "";
  if (titleLines.length >= 2) {
    artist = titleLines[0];
    title = stripQuotes(titleLines[1]);
  } else if (titleLines.length === 1) {
    title = stripQuotes(titleLines[0]);
  }

  if (!title) {
    const ogTitle = $('meta[property="og:title"]').attr("content") ?? "";
    title = stripQuotes(
      ogTitle.replace(/\s*(?:→|->|—|–|-)\s*Here Press\s*$/i, "").trim(),
    );
  }

  // Description: the non-meta text block, plus the meta specs paragraphs
  const descBlock = htmlToText($, $(".text").not(".meta").first());
  const metaBlock = $(".text.meta");
  // Drop the title paragraph from the meta specs
  metaBlock.find("p.title").remove();
  const specs = htmlToText($, metaBlock.first());
  const description = [descBlock, specs].filter(Boolean).join("\n\n").trim();

  // Images: slider figures. Older pages lazy-load via data-flickity-lazyload
  // (src is a placeholder gif); newer Sanity pages use a plain src.
  const imageUrls: string[] = [];
  $(".each__slide img, .slider img").each((_, el) => {
    const src =
      $(el).attr("data-flickity-lazyload") ||
      $(el).attr("data-src") ||
      $(el).attr("src");
    if (src && !src.startsWith("data:")) {
      const full = normalizeUrl(src, BASE);
      if (!imageUrls.includes(full)) imageUrls.push(full);
    }
  });
  if (imageUrls.length === 0) {
    const og = $('meta[property="og:image"]').attr("content");
    if (og) imageUrls.push(normalizeUrl(og, BASE));
  }
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  const bodyLower = $.root().text().toLowerCase();
  const availability =
    bodyLower.includes("out of stock") || bodyLower.includes("sold out")
      ? "sold out"
      : "available";

  const artistExists = artist ? await artistExistsInDb(artist) : false;

  return {
    title,
    artist,
    artistExistsInDb: artistExists,
    description,
    coverUrl,
    images,
    availability,
    purchaseLink: productUrl,
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "herepress.csv");

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
