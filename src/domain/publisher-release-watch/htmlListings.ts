import * as cheerio from "cheerio";
import type { WatchedProduct } from "./watchlist";

const USER_AGENT = "PhotobookersReleaseWatch/1.0";

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
    },
  });
  if (!res.ok) throw new Error(`HTML fetch HTTP ${res.status}: ${url}`);
  return res.text();
}

function cleanText(s: string): string {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

function titleFromSlug(pathname: string): string {
  const slug = pathname.replace(/\/+$/, "").split("/").pop() ?? pathname;
  return decodeURIComponent(slug).replace(/[-_]+/g, " ");
}

/** Jane & Jeremy — Squarespace shop listing. */
export async function fetchJaneJeremyProducts(
  listingUrl: string,
): Promise<WatchedProduct[]> {
  const html = await fetchHtml(listingUrl);
  const $ = cheerio.load(html);
  const base = new URL(listingUrl).origin;
  const seen = new Set<string>();
  const out: WatchedProduct[] = [];

  $('a[href*="/shop3/p/"]').each((_, el) => {
    const href = $(el).attr("href")?.split("?")[0]?.trim();
    if (!href) return;
    let full: string;
    try {
      full = new URL(href, base).href.replace(/\/$/, "");
    } catch {
      return;
    }
    if (seen.has(full)) return;
    seen.add(full);
    const text = cleanText($(el).text());
    out.push({
      key: full,
      title: text || titleFromSlug(new URL(full).pathname),
      url: full,
    });
  });

  return out;
}

/** Libraryman — custom site, book pages are single-level paths. */
export async function fetchLibrarymanProducts(
  listingUrl: string,
): Promise<WatchedProduct[]> {
  const html = await fetchHtml(listingUrl);
  const $ = cheerio.load(html);
  const base = "https://libraryman.se";
  const skip = new Set([
    "/books",
    "/books/",
    "/books/rare",
    "/products",
    "/about",
    "/stockists",
    "/contact",
    "/award",
    "/cart",
    "/",
  ]);
  const seen = new Set<string>();
  const out: WatchedProduct[] = [];

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")?.split("?")[0]?.trim();
    if (!href) return;
    let full: string;
    try {
      full = new URL(href, listingUrl).href.replace(/\/$/, "");
    } catch {
      return;
    }
    if (!full.startsWith(base)) return;
    const { pathname } = new URL(full);
    if (skip.has(pathname) || skip.has(pathname + "/")) return;
    const parts = pathname.replace(/^\/|\/$/g, "").split("/");
    if (parts.length !== 1 || !parts[0]) return;
    if (seen.has(full)) return;
    seen.add(full);
    const text = cleanText($(el).text());
    out.push({
      key: full,
      title: text || titleFromSlug(pathname),
      url: full,
    });
  });

  return out;
}

/** Photo Editions — Cargo Collective project pages. */
export async function fetchPhotoEditionsProducts(
  listingUrl: string,
): Promise<WatchedProduct[]> {
  const html = await fetchHtml(listingUrl);
  const $ = cheerio.load(html);
  const base = "https://photoeditions.pub";
  const skip = new Set([
    "",
    "/",
    "Main-page",
    "/Main-page",
    "Information",
    "/Information",
  ]);
  const seen = new Set<string>();
  const out: WatchedProduct[] = [];

  $("a[href]").each((_, el) => {
    let href = $(el).attr("href")?.trim();
    if (!href) return;
    if (href.startsWith("mailto:") || href.startsWith("http")) {
      if (href.startsWith("http") && !href.startsWith(base)) return;
      if (href.startsWith("http")) {
        try {
          href = new URL(href).pathname;
        } catch {
          return;
        }
      } else {
        return;
      }
    }
    href = href.replace(/^\//, "").split("?")[0] ?? "";
    if (!href || href.includes(" ") || skip.has(href) || skip.has("/" + href)) {
      return;
    }
    const full = `${base}/${href}`.replace(/\/$/, "");
    if (seen.has(full)) return;
    seen.add(full);
    const text = cleanText($(el).text());
    out.push({
      key: full,
      title: text || titleFromSlug("/" + href),
      url: full,
    });
  });

  return out;
}

/** Nazraeli — Squarespace catalogue. */
export async function fetchNazraeliProducts(
  listingUrl: string,
): Promise<WatchedProduct[]> {
  const html = await fetchHtml(listingUrl);
  const $ = cheerio.load(html);
  const base = "https://www.nazraeli.com";
  const seen = new Set<string>();
  const out: WatchedProduct[] = [];

  $('a[href*="/complete-catalogue/"]').each((_, el) => {
    const href = $(el).attr("href")?.split("?")[0]?.trim();
    if (!href) return;
    let full: string;
    try {
      full = new URL(href, base).href.replace(/\/$/, "");
    } catch {
      return;
    }
    if (!full.includes("/complete-catalogue/")) return;
    if (seen.has(full)) return;
    seen.add(full);
    const text = cleanText($(el).text());
    out.push({
      key: full,
      title: text || titleFromSlug(new URL(full).pathname),
      url: full,
    });
  });

  return out;
}

export async function fetchHtmlListingProducts(
  publisherId: string,
  listingUrl: string,
): Promise<WatchedProduct[]> {
  switch (publisherId) {
    case "jane-jeremy":
      return fetchJaneJeremyProducts(listingUrl);
    case "libraryman":
      return fetchLibrarymanProducts(listingUrl);
    case "photo-editions":
      return fetchPhotoEditionsProducts(listingUrl);
    case "nazraeli":
      return fetchNazraeliProducts(listingUrl);
    default:
      throw new Error(`No HTML listing scraper for publisher: ${publisherId}`);
  }
}
