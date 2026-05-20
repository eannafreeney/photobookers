import type { Context } from "hono";
import {
  HtmlEscapedCallbackPhase,
  HtmlEscapedString,
  resolveCallback,
} from "hono/utils/html";
import { ContentfulStatusCode } from "hono/utils/http-status";

export const HXML_CONTENT_TYPE = "application/vnd.hyperview+xml";

/** Hono JSX strips `key` from props; Hyperview lists need a `key` attribute on `<item>`. */
export const hyperviewXmlFixes = (xml: string) =>
  xml.replace(/ list-key="/g, ' key="');

export const hyperview =
  (c: Context) =>
  (
    node: HtmlEscapedString | Promise<HtmlEscapedString> | string,
    status = 200,
  ) => {
    const headers = { "Content-Type": HXML_CONTENT_TYPE };

    if (typeof node !== "object") {
      return c.html(hyperviewXmlFixes(node), status as ContentfulStatusCode, headers);
    }

    return resolveCallback(
      node,
      HtmlEscapedCallbackPhase.Stringify,
      false,
      {},
    ).then((rendered) =>
      c.html(hyperviewXmlFixes(rendered), status as ContentfulStatusCode, headers),
    );
  };

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
