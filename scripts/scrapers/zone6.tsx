/**
 * Zone6 Press scraper
 * https://zone6press.com/
 * All data is in __PRELOADED_STATE__ on the homepage — single request only.
 *
 * Run: npx tsx scripts/scrapers/zone6press.ts [output-path]
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

const BASE = "https://zone6press.com";
const BOOKSHOP_SET_ID = "T3402928455"; // "Bookshop" set in the Cargo structure
const FREIGHT_BASE = "https://freight.cargo.site";

function cargoImageUrl(hash: string, name: string, width = 1000): string {
  return `${FREIGHT_BASE}/w/${width}/i/${hash}/${encodeURIComponent(name)}`;
}

async function getPreloadedState(): Promise<any> {
  const html = await fetchHtml(BASE);
  const marker = "window.__PRELOADED_STATE__=";
  const idx = html.indexOf(marker);
  if (idx === -1) throw new Error("Could not find __PRELOADED_STATE__");
  const jsonStart = idx + marker.length;
  const scriptEnd = html.indexOf("</script>", jsonStart);
  const jsonStr = html.slice(jsonStart, scriptEnd).replace(/;$/, "").trim();
  return JSON.parse(jsonStr);
}

function parseDescriptionContent(content: string): {
  title: string;
  artist: string;
  description: string;
  isSoldOut: boolean;
} {
  const $ = cheerio.load(`<body>${content}</body>`);

  // First <b> contains "Title<br/>Artist"
  const firstB = $("b").first();
  const firstBHtml = firstB.html() ?? "";
  const bParts = firstBHtml
    .split(/<br\s*\/?>/i)
    .map((s) => cheerio.load(s).text().trim())
    .filter(Boolean);

  const title = bParts[0] ?? "";
  const artist = bParts[1] ?? "";

  firstB.remove();

  const remainingHtml = $("body").html() ?? "";
  const description = decodeHtmlEntities(
    remainingHtml.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, ""),
  )
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n")
    .trim();

  // Available if shop-product element present; sold out if text says so
  const hasPurchase = content.includes("<shop-product ");
  const isSoldOut = !hasPurchase && content.toLowerCase().includes("sold out");

  return { title, artist, description, isSoldOut };
}

function getContentImageUrls(
  content: string,
  mediaMap: Map<string, { hash: string; name: string }>,
): string[] {
  const $ = cheerio.load(content);
  const urls: string[] = [];

  $("media-item").each((_, el) => {
    // Pattern 1: direct src attribute (e.g. class="zoomable" with src)
    const src = $(el).attr("src");
    if (src) {
      urls.push(src);
      return;
    }
    // Pattern 2: hash attribute → reconstruct via freight CDN
    const hash = $(el).attr("hash");
    if (hash) {
      const entry = mediaMap.get(hash);
      if (entry) urls.push(cargoImageUrl(entry.hash, entry.name));
    }
  });

  return urls;
}

async function main() {
  const outPath =
    process.argv[2] ?? join(process.cwd(), "output", "zone6press.csv");

  console.log("Fetching preloaded state...");
  const state = await getPreloadedState();

  const { structure, pages, sets } = state;
  const bookSetIds: string[] = structure.byParent[BOOKSHOP_SET_ID] ?? [];
  console.log(`Found ${bookSetIds.length} book sets.`);

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

  for (const bookSetId of bookSetIds) {
    const bookSet = sets.byId[bookSetId];
    if (!bookSet) continue;

    const pageIds: string[] = structure.byParent[bookSetId] ?? [];
    const bookPages = pageIds
      .map((id: string) => pages.byId[id])
      .filter(Boolean);

    // Desktop description page has title, artist, description, availability
    const descPage = bookPages.find((p: any) =>
      p.title?.includes("Description (D)"),
    );
    // Image page: not a menu/title/description/thumbnail page
    const imagePage = bookPages.find(
      (p: any) =>
        !p.title?.includes("(M)") &&
        !p.title?.includes("(D)") &&
        !p.title?.includes("Thumbnail"),
    );

    if (!descPage) {
      console.warn(`No description page for set ${bookSet.title}, skipping`);
      continue;
    }

    const { title, artist, description, isSoldOut } = parseDescriptionContent(
      descPage.content ?? "",
    );

    // Build hash→media map for the image page
    const mediaMap = new Map<string, { hash: string; name: string }>();
    if (imagePage?.media) {
      for (const m of imagePage.media as any[]) {
        mediaMap.set(m.hash, { hash: m.hash, name: m.name });
      }
    }

    // Cover from thumbnail; gallery from content media-items
    const thumb = imagePage?.thumbnail;
    const coverUrl = thumb ? cargoImageUrl(thumb.hash, thumb.name) : "";
    const contentImages = imagePage?.content
      ? getContentImageUrls(imagePage.content, mediaMap)
      : [];
    const images = contentImages.join("|");

    const purchaseLink = imagePage?.purl
      ? `${BASE}/${imagePage.purl}`
      : `${BASE}/${bookSet.purl}`;

    const artistExists = await artistExistsInDb(artist);

    console.log(`  "${title}" by ${artist}`);

    lines.push(
      rowToCsv({
        title: title || bookSet.title,
        artist,
        artistExistsInDb: artistExists,
        description,
        coverUrl,
        images,
        availability: isSoldOut ? "sold out" : "available",
        purchaseLink,
      }),
    );
  }

  await mkdir(join(outPath, ".."), { recursive: true });
  await writeFile(outPath, lines.join("\n"), "utf8");
  console.log(`Wrote ${lines.length - 1} rows to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
