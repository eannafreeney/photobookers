const SUPABASE_OBJECT_PREFIX = "/storage/v1/object/public/";
const SUPABASE_RENDER_PREFIX = "/storage/v1/render/image/public/";

/** Soft cap for a single newsletter `<img>` download (bytes). */
export const MAX_NEWSLETTER_IMAGE_BYTES = 150 * 1024;

/** Retina multiplier for email display width → fetch width. */
export const EMAIL_IMAGE_RETINA_FACTOR = 2;

export const EMAIL_IMAGE_MAX_FETCH_WIDTH = 1200;

export const EMAIL_IMAGE_DEFAULT_QUALITY = 75;

export type HeroImageSources = {
  src: string;
  srcSet: string;
  sizes: string;
  preloadHref: string;
};

/** Supabase Storage image transform (requires Pro plan). Returns original URL if not applicable. */
export function supabaseRenderImageUrl(
  url: string,
  { width, quality = 75 }: { width: number; quality?: number },
): string {
  try {
    const parsed = new URL(url);
    const objectIdx = parsed.pathname.indexOf(SUPABASE_OBJECT_PREFIX);
    const renderIdx = parsed.pathname.indexOf(SUPABASE_RENDER_PREFIX);
    if (objectIdx === -1 && renderIdx === -1) return url;

    const bucketPath =
      objectIdx !== -1
        ? parsed.pathname.slice(objectIdx + SUPABASE_OBJECT_PREFIX.length)
        : parsed.pathname.slice(renderIdx + SUPABASE_RENDER_PREFIX.length);

    parsed.pathname = `${SUPABASE_RENDER_PREFIX}${bucketPath}`;
    parsed.search = `width=${width}&quality=${quality}`;
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Bunny Optimizer query params. No-op until Optimizer is enabled on the pull
 * zone; safe to attach either way (CDN ignores unknown params today).
 */
export function bunnyOptimizerImageUrl(
  url: string,
  { width, quality = EMAIL_IMAGE_DEFAULT_QUALITY }: { width: number; quality?: number },
): string {
  try {
    const parsed = new URL(url);
    if (!isBunnyCdnHost(parsed.hostname)) return url;
    parsed.searchParams.set("width", String(width));
    parsed.searchParams.set("quality", String(quality));
    return parsed.toString();
  } catch {
    return url;
  }
}

export function isBunnyCdnHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "cdn.photobookers.com" ||
    host.endsWith(".b-cdn.net") ||
    (host.startsWith("cdn.") && host.endsWith(".photobookers.com"))
  );
}

export function isSupabaseStorageHost(hostname: string): boolean {
  return hostname.toLowerCase().endsWith(".supabase.co");
}

/** Hosts we will fetch/resize for newsletter email images. */
export function isAllowedEmailImageSourceHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (isSupabaseStorageHost(host)) return true;
  if (isBunnyCdnHost(host)) return true;
  if (host === "www.photobookers.com" || host === "photobookers.com") return true;
  try {
    const bunnyBase = process.env.BUNNY_CDN_BASE?.trim();
    if (bunnyBase) {
      const bunnyHost = new URL(bunnyBase).hostname.toLowerCase();
      if (bunnyHost && host === bunnyHost) return true;
    }
  } catch {
    // ignore invalid env
  }
  return false;
}

export function emailImageFetchWidth(displayWidthPx: number): number {
  const w = Math.round(displayWidthPx * EMAIL_IMAGE_RETINA_FACTOR);
  return Math.min(Math.max(w, 1), EMAIL_IMAGE_MAX_FETCH_WIDTH);
}

/** `/api/email-image?u=…&w=…&q=…` — sharp resize for oversized CDN assets. */
export function buildEmailImageProxyUrl(
  appBaseUrl: string,
  sourceUrl: string,
  {
    width,
    quality = EMAIL_IMAGE_DEFAULT_QUALITY,
  }: { width: number; quality?: number },
): string {
  const base = appBaseUrl.replace(/\/$/, "");
  const params = new URLSearchParams({
    u: sourceUrl,
    w: String(width),
    q: String(quality),
  });
  return `${base}/api/email-image?${params}`;
}

export function parseEmailImageProxyQuery(query: {
  u?: string;
  w?: string;
  q?: string;
}): {
  sourceUrl: string;
  width: number;
  quality: number;
} | null {
  const sourceUrl = query.u?.trim();
  if (!sourceUrl) return null;
  try {
    const parsed = new URL(sourceUrl);
    if (parsed.protocol !== "https:") return null;
    if (!isAllowedEmailImageSourceHost(parsed.hostname)) return null;
  } catch {
    return null;
  }

  const width = Number(query.w ?? "600");
  const quality = Number(query.q ?? String(EMAIL_IMAGE_DEFAULT_QUALITY));
  if (!Number.isFinite(width) || width < 1) return null;
  if (!Number.isFinite(quality) || quality < 1 || quality > 100) return null;

  return {
    sourceUrl,
    width: Math.min(Math.round(width), EMAIL_IMAGE_MAX_FETCH_WIDTH),
    quality: Math.round(quality),
  };
}

/** Responsive hero cover URLs — mobile LCP uses the 480w candidate. */
export function heroLcpImageSources(url: string): HeroImageSources {
  const w480 = supabaseRenderImageUrl(url, { width: 480 });
  const w800 = supabaseRenderImageUrl(url, { width: 800 });

  if (w480 === url) {
    return {
      src: url,
      srcSet: url,
      sizes: "100vw",
      preloadHref: url,
    };
  }

  return {
    src: w480,
    srcSet: `${w480} 480w, ${w800} 800w, ${url} 1200w`,
    sizes: "(max-width: 767px) 100vw, 50vw",
    preloadHref: w480,
  };
}
