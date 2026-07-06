import { createRoute } from "hono-fsr";
import { getBaseUrl } from "../lib/hyperview.js";
import {
  getSitemapEntries
} from "../features/app/sitemapServices.js";
function escapeXml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function toSitemapXml(origin, entries) {
  const urls = entries.map((entry) => {
    const loc = escapeXml(`${origin}${entry.loc}`);
    const lastmod = entry.lastmod ? `
    <lastmod>${entry.lastmod}</lastmod>` : "";
    return `  <url>
    <loc>${loc}</loc>${lastmod}
  </url>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}
const GET = createRoute(async (c) => {
  const origin = getBaseUrl(c);
  const entries = await getSitemapEntries();
  const xml = toSitemapXml(origin, entries);
  return c.body(xml, 200, {
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"
  });
});
export {
  GET
};
