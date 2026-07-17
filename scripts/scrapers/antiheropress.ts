/**
 * Antihero Press scraper
 * https://antiheropress.com/
 * Small catalogue: book pages ("projects") are linked from the home page as
 *   <a data-type="project" data-title="..." href="/{slug}/">
 * Title comes from data-title; artist is the line following the title in a
 * centered text block; the "BUY" anchor points to the external shop.
 * Images: content <img> in .lay-content (responsive srcset -> original file).
 *
 * Run: npx tsx scripts/scrapers/antiheropress.ts [output-path]
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

const BASE = "https://antiheropress.com";

// Chrome / mockup / logo assets that are not book photography
const IMAGE_SKIP = /ap[_-]?logo|(^|\/)logo|bildschirmfoto|screenshot/i;

type IndexEntry = { url: string; title: string };

function getBooksFromIndex(html: string): IndexEntry[] {
  const $ = cheerio.load(html);
  const entries: IndexEntry[] = [];
  const seen = new Set<string>();
  $('a[data-type="project"]').each((_, el) => {
    const href = $(el).attr("href");
    const title = ($(el).attr("data-title") ?? "").trim();
    if (!href) return;
    const url = normalizeUrl(href.trim().split("?")[0], BASE);
    if (seen.has(url)) return;
    seen.add(url);
    entries.push({ url, title });
  });
  return entries;
}

/** Strip a WordPress responsive size suffix (-1024x768) to get the original file. */
function toOriginalImage(src: string): string {
  return src.replace(/-\d+x\d+(\.[a-z]+)(\?.*)?$/i, "$1");
}

/** Pick the best source for an <img>: data-src, else largest srcset entry, else src. */
function bestImageSrc($el: cheerio.Cheerio<any>): string | null {
  const dataSrc = $el.attr("data-src");
  if (dataSrc && !dataSrc.startsWith("data:")) return dataSrc;
  const srcset = $el.attr("srcset") || $el.attr("data-srcset");
  if (srcset) {
    const last = srcset
      .split(",")
      .map((s) => s.trim().split(/\s+/)[0])
      .filter(Boolean)
      .pop();
    if (last) return last;
  }
  const src = $el.attr("src");
  if (src && !src.startsWith("data:")) return src;
  return null;
}

async function scrapeBookPage(
  productUrl: string,
  indexTitle: string,
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
  const html = await fetchHtml(productUrl);
  const $ = cheerio.load(html);
  const content = $(".lay-content");

  // Gather centered text blocks (deduped; the layout renders each twice)
  const textBlocks: string[][] = [];
  const seenBlocks = new Set<string>();
  content.find(".text").each((_, el) => {
    const lines = $(el)
      .find("p")
      .map((_, p) => cheerio.load($(p).html() ?? "").text().trim())
      .get()
      .filter(Boolean);
    if (lines.length === 0) return;
    const key = lines.join("");
    if (seenBlocks.has(key)) return;
    seenBlocks.add(key);
    textBlocks.push(lines);
  });

  // Title from the index; fall back to the first short text line
  // The first content text block is the hero: [title, artist?, BUY?] in order.
  // (The index's data-title is unreliable — sometimes it's the artist name.)
  const heroLines = (textBlocks[0] ?? []).filter(
    (l) => l.toLowerCase() !== "buy",
  );
  let title = heroLines[0] ?? indexTitle;
  let artist = "";
  // Artist is the short second line; guard against artist-less compilations
  // whose second line is a description paragraph.
  if (heroLines[1] && heroLines[1].length <= 60) artist = heroLines[1];

  // Description: the longest text block (the write-up + specs)
  const description =
    textBlocks
      .map((lines) => lines.join("\n"))
      .filter((t) => !/^buy$/i.test(t.trim()))
      .sort((a, b) => b.length - a.length)[0]
      ?.trim() ?? "";

  // Purchase link: the external BUY anchor
  let purchaseLink = productUrl;
  content.find("a").each((_, el) => {
    if (purchaseLink !== productUrl) return;
    const text = $(el).text().trim().toLowerCase();
    const href = $(el).attr("href");
    if (text === "buy" && href) purchaseLink = href.trim();
  });

  // Images: content photography, de-duplicated by original filename
  const imageUrls: string[] = [];
  const seenImg = new Set<string>();
  content.find("img").each((_, el) => {
    const raw = bestImageSrc($(el));
    if (!raw) return;
    const full = toOriginalImage(normalizeUrl(raw, BASE));
    if (IMAGE_SKIP.test(full) || seenImg.has(full)) return;
    seenImg.add(full);
    imageUrls.push(full);
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
    purchaseLink,
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "antiheropress.csv");

  console.log("Fetching home page for book links...");
  const homeHtml = await fetchHtml(`${BASE}/`);
  const entries = getBooksFromIndex(homeHtml);
  console.log(`Found ${entries.length} book links.`);

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

  for (let i = 0; i < entries.length; i++) {
    const { url, title } = entries[i];
    console.log(`[${i + 1}/${entries.length}] ${url}`);
    try {
      const row = await scrapeBookPage(url, title);
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
