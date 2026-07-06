import { load } from "cheerio";
import juice from "juice";
const emailFontSans = "Instrument Sans, ui-sans-serif, system-ui, sans-serif";
const emailFontLogo = "Caveat, cursive";
function normalizeEmailInlineStyles(html) {
  return html.replace(/style="font-family:"(?=>)/gi, 'style=""').replace(/font-family:&quot;([^;&"]+)&quot;/gi, "font-family:$1").replace(/font-family:\s*'([^']+)'/gi, "font-family:$1").replace(/font-family:\s*"([^"]+)"/gi, "font-family:$1").replace(/font-family:\s*"(?=[;\">])/gi, "").replace(/font-family:\s*;/gi, "").replace(/;\s*;/g, ";").replace(/style="\s*;?\s*"/gi, 'style=""');
}
function prepareNewsletterHtmlForEsp(html) {
  const $ = load(html);
  const headStyles = $("head style").map((_, element) => $(element).html() ?? "").get().filter(Boolean).join("\n");
  if (headStyles.length > 0 && $("body style.esp-inline-styles").length === 0) {
    $("body").prepend(
      `<style type="text/css" class="esp-inline-styles">${headStyles}</style>`
    );
  }
  const withBodyStyles = $.html();
  const normalized = normalizeEmailInlineStyles(withBodyStyles);
  const inlined = juice(normalized, {
    preserveMediaQueries: true,
    preserveFontFaces: true,
    removeStyleTags: false,
    applyWidthAttributes: true,
    applyHeightAttributes: true
  });
  return normalizeEmailInlineStyles(inlined);
}
export {
  emailFontLogo,
  emailFontSans,
  normalizeEmailInlineStyles,
  prepareNewsletterHtmlForEsp
};
