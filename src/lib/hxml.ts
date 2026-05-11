import type { Context } from "hono";

export const HXML_CONTENT_TYPE = "application/vnd.hyperview+xml";

/**
 * Wraps an HXML string in the standard Hyperview <doc> envelope and returns
 * an HTTP response with the correct content-type header.
 *
 * Usage in a route:
 *   return hxml(c, `<screen>...</screen>`);
 */
export function hxml(c: Context, body: string, status = 200) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<doc xmlns="https://hyperview.org/hyperview">\n${body}\n</doc>`;
  return c.body(xml, status, {
    "Content-Type": `${HXML_CONTENT_TYPE}; charset=utf-8`,
  });
}

/** Escape a plain string so it is safe to embed in XML text nodes. */
export function xmlText(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
