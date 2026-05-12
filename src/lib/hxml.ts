import type { Context } from "hono";
import { HtmlEscapedString } from "hono/utils/html";
import { ContentfulStatusCode } from "hono/utils/http-status";

export const HXML_CONTENT_TYPE = "application/vnd.hyperview+xml";

export const hyperview =
  (c: Context) =>
  (
    node: HtmlEscapedString | Promise<HtmlEscapedString> | string,
    status = 200,
  ) =>
    c.html(node, status as ContentfulStatusCode, {
      "Content-Type": "application/vnd.hyperview+xml",
    });

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
