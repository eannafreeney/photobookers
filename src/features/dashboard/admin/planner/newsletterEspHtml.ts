import { load } from "cheerio";
import juice from "juice";

/**
 * Quote-free stacks for inline `style` attributes. MailerLite rewrites pasted HTML
 * and truncates `font-family:"Caveat"` / `font-family:'Caveat'` to `font-family:"`,
 * which breaks rendering. Unquoted stacks match what MailerLite already preserves
 * for body copy (`Instrument Sans, ui-sans-serif, ...`).
 */
export const emailFontSans =
  "Instrument Sans, ui-sans-serif, system-ui, sans-serif";
export const emailFontLogo = "Caveat, cursive";

/** Strip quotes from font-family so ESP paste/save cannot truncate the attribute. */
export function normalizeEmailInlineStyles(html: string): string {
  return html
    .replace(/style="font-family:"(?=>)/gi, 'style=""')
    .replace(/font-family:&quot;([^;&"]+)&quot;/gi, "font-family:$1")
    .replace(/font-family:\s*'([^']+)'/gi, "font-family:$1")
    .replace(/font-family:\s*"([^"]+)"/gi, "font-family:$1")
    .replace(/font-family:\s*"(?=[;\">])/gi, "")
    .replace(/font-family:\s*;/gi, "")
    .replace(/;\s*;/g, ";")
    .replace(/style="\s*;?\s*"/gi, 'style=""');
}

/**
 * Prepare MJML HTML for paste into MailerLite / similar ESPs:
 * - duplicate head CSS into body (for clients that only keep body)
 * - inline class/styles onto elements (MailerLite strips `<style>` on save)
 * - fix font-family quoting so inline styles stay valid
 */
export function prepareNewsletterHtmlForEsp(html: string): string {
  const $ = load(html);
  const headStyles = $("head style")
    .map((_, element) => $(element).html() ?? "")
    .get()
    .filter(Boolean)
    .join("\n");

  if (headStyles.length > 0 && $("body style.esp-inline-styles").length === 0) {
    $("body").prepend(
      `<style type="text/css" class="esp-inline-styles">${headStyles}</style>`,
    );
  }

  const withBodyStyles = $.html();
  const normalized = normalizeEmailInlineStyles(withBodyStyles);

  const inlined = juice(normalized, {
    preserveMediaQueries: true,
    preserveFontFaces: true,
    removeStyleTags: false,
    applyWidthAttributes: true,
    applyHeightAttributes: true,
  });

  return normalizeEmailInlineStyles(inlined);
}
