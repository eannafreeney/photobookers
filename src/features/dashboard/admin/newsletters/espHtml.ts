import { load } from "cheerio";
import juice from "juice";
import { FEATURE_COL_MAX_WIDTH } from "./styles";

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
function normalizeEmailInlineStyles(html: string): string {
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

/** Gmail ignores @media; inline-block + max-width wraps to stack without it. */
function enforceFeatureColHybridLayout(style: string): string {
  const withoutLayout = style
    .replace(/(?:^|;)\s*display:\s*[^;]+;?/gi, "")
    .replace(/(?:^|;)\s*width:\s*[^;]+;?/gi, "")
    .replace(/(?:^|;)\s*max-width:\s*[^;]+;?/gi, "")
    .replace(/(?:^|;)\s*vertical-align:\s*[^;]+;?/gi, "")
    .replace(/(?:^|;)\s*box-sizing:\s*[^;]+;?/gi, "")
    .replace(/(?:^|;)\s*margin-bottom:\s*[^;]+;?/gi, "")
    .replace(/;\s*;/g, ";")
    .replace(/^;|;$/g, "")
    .trim();

  const layout = `display:inline-block;width:100%;max-width:${FEATURE_COL_MAX_WIDTH};vertical-align:top;box-sizing:border-box;margin-bottom:24px`;
  return withoutLayout ? `${layout};${withoutLayout}` : layout;
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
  });

  const $inlined = load(inlined);
  // Juice may add table-column widths from legacy CSS; hybrid cols use inline max-width.
  $inlined(".feature-col").each((_, element) => {
    const $el = $inlined(element);
    $el.removeAttr("width");
    const style = $el.attr("style") ?? "";
    $el.attr("style", enforceFeatureColHybridLayout(style));
  });
  return normalizeEmailInlineStyles($inlined.html());
}
