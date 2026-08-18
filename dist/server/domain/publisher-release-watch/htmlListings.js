import * as cheerio from "cheerio";
const USER_AGENT = "PhotobookersReleaseWatch/1.0";
async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml"
    }
  });
  if (!res.ok) throw new Error(`HTML fetch HTTP ${res.status}: ${url}`);
  return res.text();
}
function cleanText(s) {
  return (s ?? "").replace(/\s+/g, " ").trim();
}
function titleFromSlug(pathname) {
  const slug = pathname.replace(/\/+$/, "").split("/").pop() ?? pathname;
  return decodeURIComponent(slug).replace(/[-_]+/g, " ");
}
async function fetchJaneJeremyProducts(listingUrl) {
  const html = await fetchHtml(listingUrl);
  const $ = cheerio.load(html);
  const base = new URL(listingUrl).origin;
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  $('a[href*="/shop3/p/"]').each((_, el) => {
    const href = $(el).attr("href")?.split("?")[0]?.trim();
    if (!href) return;
    let full;
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
      url: full
    });
  });
  return out;
}
async function fetchLibrarymanProducts(listingUrl) {
  const html = await fetchHtml(listingUrl);
  const $ = cheerio.load(html);
  const base = "https://libraryman.se";
  const skip = /* @__PURE__ */ new Set([
    "/books",
    "/books/",
    "/books/rare",
    "/products",
    "/about",
    "/stockists",
    "/contact",
    "/award",
    "/cart",
    "/"
  ]);
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")?.split("?")[0]?.trim();
    if (!href) return;
    let full;
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
      url: full
    });
  });
  return out;
}
async function fetchPhotoEditionsProducts(listingUrl) {
  const html = await fetchHtml(listingUrl);
  const $ = cheerio.load(html);
  const base = "https://photoeditions.pub";
  const skip = /* @__PURE__ */ new Set([
    "",
    "/",
    "Main-page",
    "/Main-page",
    "Information",
    "/Information"
  ]);
  const seen = /* @__PURE__ */ new Set();
  const out = [];
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
      url: full
    });
  });
  return out;
}
async function fetchNazraeliProducts(listingUrl) {
  const html = await fetchHtml(listingUrl);
  const $ = cheerio.load(html);
  const base = "https://www.nazraeli.com";
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  $('a[href*="/complete-catalogue/"]').each((_, el) => {
    const href = $(el).attr("href")?.split("?")[0]?.trim();
    if (!href) return;
    let full;
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
      url: full
    });
  });
  return out;
}
async function fetchHtmlListingProducts(publisherId, listingUrl) {
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
export {
  fetchHtmlListingProducts,
  fetchJaneJeremyProducts,
  fetchLibrarymanProducts,
  fetchNazraeliProducts,
  fetchPhotoEditionsProducts
};
