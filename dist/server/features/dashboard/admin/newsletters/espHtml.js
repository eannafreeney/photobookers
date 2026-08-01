import { load } from "cheerio";
import juice from "juice";
import { FEATURE_COL_MAX_WIDTH } from "./styles.js";
const emailFontSans = "Instrument Sans, ui-sans-serif, system-ui, sans-serif";
const emailFontLogo = "Caveat, cursive";
function normalizeEmailInlineStyles(html) {
  return html.replace(/style="font-family:"(?=>)/gi, 'style=""').replace(/font-family:&quot;([^;&"]+)&quot;/gi, "font-family:$1").replace(/font-family:\s*'([^']+)'/gi, "font-family:$1").replace(/font-family:\s*"([^"]+)"/gi, "font-family:$1").replace(/font-family:\s*"(?=[;\">])/gi, "").replace(/font-family:\s*;/gi, "").replace(/;\s*;/g, ";").replace(/style="\s*;?\s*"/gi, 'style=""');
}
function enforceFeatureColHybridLayout(style) {
  const withoutLayout = style.replace(/(?:^|;)\s*display:\s*[^;]+;?/gi, "").replace(/(?:^|;)\s*width:\s*[^;]+;?/gi, "").replace(/(?:^|;)\s*max-width:\s*[^;]+;?/gi, "").replace(/(?:^|;)\s*vertical-align:\s*[^;]+;?/gi, "").replace(/(?:^|;)\s*box-sizing:\s*[^;]+;?/gi, "").replace(/(?:^|;)\s*margin-bottom:\s*[^;]+;?/gi, "").replace(/;\s*;/g, ";").replace(/^;|;$/g, "").trim();
  const layout = `display:inline-block;width:100%;max-width:${FEATURE_COL_MAX_WIDTH};vertical-align:top;box-sizing:border-box;margin-bottom:24px`;
  return withoutLayout ? `${layout};${withoutLayout}` : layout;
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
    removeStyleTags: false
  });
  const $inlined = load(inlined);
  $inlined(".feature-col").each((_, element) => {
    const $el = $inlined(element);
    $el.removeAttr("width");
    const style = $el.attr("style") ?? "";
    $el.attr("style", enforceFeatureColHybridLayout(style));
  });
  return normalizeEmailInlineStyles($inlined.html());
}
export {
  emailFontLogo,
  emailFontSans,
  prepareNewsletterHtmlForEsp
};
