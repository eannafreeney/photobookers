import { load } from "cheerio";
import {
  MAX_NEWSLETTER_IMAGE_BYTES,
  buildEmailImageProxyUrl,
  bunnyOptimizerImageUrl,
  emailImageFetchWidth,
  isAllowedEmailImageSourceHost,
  supabaseRenderImageUrl,
} from "../../../../lib/imageUrl";
import { resolveAppBaseUrl } from "./constants";

export { MAX_NEWSLETTER_IMAGE_BYTES };

export type NewsletterImageProbe = {
  src: string;
  bytes: number | null;
  ok: boolean;
};

export type NewsletterImageBudgetReport = {
  images: NewsletterImageProbe[];
  totalBytes: number;
  oversized: NewsletterImageProbe[];
};

function parseImgDisplayWidth(widthAttr: string | undefined): number | null {
  if (!widthAttr) return null;
  const n = Number.parseInt(widthAttr, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Prefer CDN-side resize; fall back to our sharp proxy URL for oversized bytes. */
export function pickNewsletterImageUrl(
  src: string,
  {
    displayWidthPx,
    contentLengthBytes,
    appBaseUrl = resolveAppBaseUrl(),
  }: {
    displayWidthPx: number;
    contentLengthBytes: number | null;
    appBaseUrl?: string;
  },
): string {
  const fetchWidth = emailImageFetchWidth(displayWidthPx);
  const supabase = supabaseRenderImageUrl(src, { width: fetchWidth });
  if (supabase !== src) return supabase;

  const withBunnyParams = bunnyOptimizerImageUrl(src, { width: fetchWidth });
  if (
    contentLengthBytes != null &&
    contentLengthBytes > MAX_NEWSLETTER_IMAGE_BYTES
  ) {
    return buildEmailImageProxyUrl(appBaseUrl, src, { width: fetchWidth });
  }

  return withBunnyParams;
}

export async function headContentLength(url: string): Promise<number | null> {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (!res.ok) return null;
    const raw = res.headers.get("content-length");
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : null;
  } catch {
    return null;
  }
}

/**
 * Rewrite newsletter `<img src>` to sized URLs (Supabase transform / Bunny
 * Optimizer params / sharp proxy for oversized CDN files).
 */
export async function rewriteNewsletterImagesForEmail(
  html: string,
  {
    appBaseUrl = resolveAppBaseUrl(),
    probe = headContentLength,
  }: {
    appBaseUrl?: string;
    probe?: (url: string) => Promise<number | null>;
  } = {},
): Promise<string> {
  const $ = load(html);
  const imgs = $("img[src]").toArray();

  await Promise.all(
    imgs.map(async (el) => {
      const $el = $(el);
      const src = $el.attr("src")?.trim();
      if (!src || src.startsWith("data:")) return;

      let hostname: string;
      try {
        hostname = new URL(src).hostname;
      } catch {
        return;
      }

      const displayWidthPx = parseImgDisplayWidth($el.attr("width")) ?? 600;
      const fetchWidth = emailImageFetchWidth(displayWidthPx);

      const supabase = supabaseRenderImageUrl(src, { width: fetchWidth });
      if (supabase !== src) {
        $el.attr("src", supabase);
        return;
      }

      if (!isAllowedEmailImageSourceHost(hostname)) return;

      const bytes = await probe(src);
      $el.attr(
        "src",
        pickNewsletterImageUrl(src, {
          displayWidthPx,
          contentLengthBytes: bytes,
          appBaseUrl,
        }),
      );
    }),
  );

  return $.html();
}

/** HEAD-probe every `<img>` and flag downloads over {@link MAX_NEWSLETTER_IMAGE_BYTES}. */
export async function probeNewsletterImageSizes(
  html: string,
  {
    probe = headContentLength,
  }: { probe?: (url: string) => Promise<number | null> } = {},
): Promise<NewsletterImageBudgetReport> {
  const $ = load(html);
  const srcs: string[] = [];
  for (const el of $("img[src]").toArray()) {
    const src = $(el).attr("src")?.trim();
    if (src && !src.startsWith("data:")) srcs.push(src);
  }

  const unique = [...new Set(srcs)];
  const images: NewsletterImageProbe[] = await Promise.all(
    unique.map(async (src) => {
      const bytes = await probe(src);
      return {
        src,
        bytes,
        ok: bytes == null || bytes <= MAX_NEWSLETTER_IMAGE_BYTES,
      };
    }),
  );

  const known = images.filter((img) => img.bytes != null);
  const totalBytes = known.reduce((sum, img) => sum + (img.bytes ?? 0), 0);
  const oversized = images.filter((img) => !img.ok);

  return { images, totalBytes, oversized };
}
