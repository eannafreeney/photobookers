/**
 * Libraryman scraper
 * https://libraryman.se/books/
 * Book pages: /{slug}/ (e.g. /luigi-danieli-the-quiet-engineer/)
 * Title/artist: h4 with " — " → artist before, title after
 * Description: .book-info + .book-specs
 * Cover: .book-first-image, images: .book-images
 *
 * Run: npx tsx scripts/scrapers/libraryman.ts [output-path]
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

const BASE = "https://libraryman.se";
const MAX_IMAGES = 7;
const SEP = " — ";

const BOOK_URLS = [
  "https://libraryman.se/luigi-danieli-the-quiet-engineer/",
  "https://libraryman.se/osamu-yokonami-after-primal/",
  "https://libraryman.se/lisa-sorgini-in-passing/",
  "https://libraryman.se/rosie-harriet-ellis-the-boyfriend-casting/",
  "https://libraryman.se/eriko-masaoka-in-the-flap-of-a-birds-wing-water-dries-up/",
  "https://libraryman.se/katrien-de-blauwer-old-sweater-gets-new-uses/",
  "https://libraryman.se/christer-stromholm-unseen-usa/",
  "https://libraryman.se/osamu-yokonami-a-feeling/",
  "https://libraryman.se/jan-lehner-a-minor-thought/",
];

function getImageUrls($: cheerio.CheerioAPI): string[] {
  const imageUrls: string[] = [];
  $(".book-first-image img[src], .book-first-image [data-src]").each(
    (_, el) => {
      const url = $(el).attr("src") || $(el).attr("data-src");
      if (url && !url.startsWith("data:")) {
        const full = normalizeUrl(url, BASE);
        if (!imageUrls.includes(full)) imageUrls.push(full);
      }
    },
  );
  $(".book-images img[src], .book-images img[data-src]").each((_, el) => {
    const url = $(el).attr("src") || $(el).attr("data-src");
    if (url && !url.startsWith("data:")) {
      const full = normalizeUrl(url, BASE);
      if (!imageUrls.includes(full)) imageUrls.push(full);
    }
  });
  if (imageUrls.length === 0) {
    $(".book-first-image img, .book-images img").each((_, el) => {
      const src = $(el).attr("src");
      if (src && !src.startsWith("data:")) {
        const full = normalizeUrl(src, BASE);
        if (!imageUrls.includes(full)) imageUrls.push(full);
      }
    });
  }
  if (imageUrls.length === 0) {
    const og = $('meta[property="og:image"]').attr("content");
    if (og) imageUrls.push(normalizeUrl(og, BASE));
  }
  return imageUrls.slice(0, MAX_IMAGES);
}

async function scrapeBook(bookUrl: string): Promise<{
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

  const heading =
    $("h4").first().text().trim() ||
    $('meta[property="og:title"]').attr("content")?.trim() ||
    "";
  const sepIndex = heading.indexOf(SEP);
  const artist =
    sepIndex > 0 ? decodeHtmlEntities(heading.slice(0, sepIndex).trim()) : "";
  const title =
    sepIndex > 0
      ? decodeHtmlEntities(heading.slice(sepIndex + SEP.length).trim())
      : heading
        ? decodeHtmlEntities(heading)
        : "";

  const infoParts: string[] = [];
  $(".book-info").each((_, el) => {
    const text = $(el).text().trim();
    if (text) infoParts.push(text);
  });
  $(".book-specs").each((_, el) => {
    const text = $(el).text().trim();
    if (text) infoParts.push(text);
  });
  const description = infoParts.join("\n\n").trim();

  const imageUrls = getImageUrls($);
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  const bodyText = $("body").text().toLowerCase();
  const isSoldOut =
    bodyText.includes("sold out") || $(".sold-out, [data-sold-out]").length > 0;
  const availability = isSoldOut ? "sold-out" : "available";

  const purchaseLink =
    $('link[rel="canonical"]').attr("href")?.trim() ||
    $('meta[property="og:url"]').attr("content")?.trim() ||
    bookUrl;
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
    availability,
    purchaseLink: finalPurchaseLink,
  };
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "libraryman-books.csv");

  const urls = [...BOOK_URLS].map((u) => u.replace(/\/$/, ""));
  const seen = new Set<string>();
  const unique = urls.filter((u) => {
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });

  console.log(`Scraping ${unique.length} book URLs`);

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

  for (let i = 0; i < unique.length; i++) {
    const url = unique[i];
    console.log(`[${i + 1}/${unique.length}] ${url}`);
    try {
      const row = await scrapeBook(url);
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
