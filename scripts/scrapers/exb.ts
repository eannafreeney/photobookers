/**
 * Atelier EXB scraper
 * https://exb.fr/en/
 * PrestaShop site.
 *
 * title:        .titre h2
 * artist:       a.aName (can be multiple, joined with ", ")
 * description:  .description .inside-container p (first paragraph)
 * images:       .swiper-slide img[src] (relative → absolute)
 * availability: productAvailableForOrder JS variable in page source
 *
 * Book URLs from: https://exb.fr/en/5-le-catalogue (paginated with ?p=N)
 *
 * Run: npx tsx scripts/scrapers/exb.ts [output-path]
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

const BASE = "https://exb.fr";
const CATALOGUE_URL = `${BASE}/en/5-le-catalogue`;

function absoluteUrl(src: string): string {
  if (src.startsWith("http")) return src;
  return `${BASE}${src.startsWith("/") ? "" : "/"}${src}`;
}

async function getBookUrls(): Promise<string[]> {
  const seen = new Set<string>();
  let page = 1;

  while (true) {
    const url = page === 1 ? CATALOGUE_URL : `${CATALOGUE_URL}?p=${page}`;
    let html: string;
    try {
      html = await fetchHtml(url);
    } catch {
      break;
    }

    const $ = cheerio.load(html);
    let found = 0;

    // Product links in the catalogue grid
    $(".contentItem a.item[href], .catalogue-grid a.item[href]").each((_, el) => {
      const href = $(el).attr("href") ?? "";
      const full = href.startsWith("http") ? href : absoluteUrl(href);
      if (full.includes("exb.fr/en/") && full.endsWith(".html") && !seen.has(full)) {
        seen.add(full);
        found++;
      }
    });

    if (found === 0) break;

    // Check for next page link
    if (!$("a.next, li.pagination_next a, a[rel='next']").length) break;
    page++;
  }

  return [...seen];
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

  // Title: <h2> in .titre block
  const title = $(".titre h2, .blocTtl h2").first().text().trim();

  // Artist: one or more a.aName links
  const artistParts: string[] = [];
  $(".titre a.aName, .blocTtl a.aName").each((_, el) => {
    const name = $(el).text().trim();
    if (name && !artistParts.includes(name)) artistParts.push(name);
  });
  const artist = artistParts.join(", ");

  // Description: first <p> inside .description .inside-container
  let description = "";
  const $descContainer = $(".description .inside-container, .descriptionBloc .inside-container").first();
  if ($descContainer.length) {
    const parts: string[] = [];
    $descContainer.find("p").each((_, el) => {
      const text = $(el).text().trim();
      if (text) parts.push(text);
    });
    description = parts.join("\n").trim();
  }

  // Images from swiper slides (no loop duplicates in static HTML)
  const imageUrls: string[] = [];
  $(".swiper-slide img[src]").each((_, el) => {
    const src = $(el).attr("src") ?? "";
    if (!src || src.startsWith("data:")) return;
    // Skip icon/SVG images
    if (src.includes(".svg") || src.includes("picto") || src.includes("logo")) return;
    const full = absoluteUrl(src);
    if (!imageUrls.includes(full)) imageUrls.push(full);
  });
  const coverUrl = imageUrls[0] ?? "";
  const images = imageUrls.slice(1).join("|");

  // Availability from JS variable in page source
  const availableMatch = html.match(/var productAvailableForOrder\s*=\s*'(\d+)'/);
  const isAvailable = availableMatch ? availableMatch[1] === "1" : true;

  // Also check #add_to_cart_so: if it exists without display:none → sold out
  const soldOutEl = $("#add_to_cart_so");
  const soldOutHidden =
    soldOutEl.attr("style")?.includes("display: none") ?? true;
  const availability =
    isAvailable && soldOutHidden ? "available" : "sold_out";

  const purchaseLink =
    $('link[rel="canonical"]').attr("href")?.trim() || pageUrl;

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
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "exb.csv");

  console.log("Collecting book URLs from catalogue...");
  const bookUrls = await getBookUrls();
  console.log(`Found ${bookUrls.length} book URLs.`);
  const limitedUrls = bookUrls.slice(0, 30);

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

  for (let i = 0; i < limitedUrls.length; i++) {
    const url = limitedUrls[i];
    console.log(`[${i + 1}/${limitedUrls.length}] ${url}`);
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
