import { bunnyEnabled, bunnyPublicUrl } from "./bunny";

const SUPABASE_OBJECT_PREFIX = "/storage/v1/object/public/";

export type HeroImageSources = {
  src: string;
  srcSet: string;
  sizes: string;
  preloadHref: string;
};

function currentSupabaseOrigin(): string | null {
  const raw = process.env.SUPABASE_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

/**
 * Rewrite legacy Supabase Storage public URLs to Bunny only when they belong to
 * the current configured Supabase project. This avoids incorrectly rewriting
 * cross-environment URLs (for example production assets referenced from staging).
 */
export function resolveStoragePublicImageUrl(url: string): string {
  if (!bunnyEnabled()) return url;

  try {
    const parsed = new URL(url);
    if (parsed.origin !== currentSupabaseOrigin()) return url;

    const prefixIndex = parsed.pathname.indexOf(SUPABASE_OBJECT_PREFIX);
    if (prefixIndex === -1) return url;

    const bucketAndPath = parsed.pathname.slice(
      prefixIndex + SUPABASE_OBJECT_PREFIX.length,
    );
    const bunnyPath = bucketAndPath.startsWith("images/")
      ? bucketAndPath.slice("images/".length)
      : bucketAndPath;
    return bunnyPublicUrl(bunnyPath);
  } catch {
    return url;
  }
}

/** Supabase Storage image transform (requires Pro plan). Returns original URL if not applicable. */
export function supabaseRenderImageUrl(
  url: string,
  { width, quality = 75 }: { width: number; quality?: number },
): string {
  try {
    const parsed = new URL(url);
    const prefixIndex = parsed.pathname.indexOf(SUPABASE_OBJECT_PREFIX);
    if (prefixIndex === -1) return url;

    const bucketPath = parsed.pathname.slice(
      prefixIndex + SUPABASE_OBJECT_PREFIX.length,
    );
    parsed.pathname = `/storage/v1/render/image/public/${bucketPath}`;
    parsed.search = `width=${width}&quality=${quality}`;
    return parsed.toString();
  } catch {
    return url;
  }
}

/** Responsive hero cover URLs — mobile LCP uses the 480w candidate. */
export function heroLcpImageSources(url: string): HeroImageSources {
  const resolved = resolveStoragePublicImageUrl(url);
  const w480 = supabaseRenderImageUrl(resolved, { width: 480 });
  const w800 = supabaseRenderImageUrl(resolved, { width: 800 });

  if (w480 === resolved) {
    return {
      src: resolved,
      srcSet: resolved,
      sizes: "100vw",
      preloadHref: resolved,
    };
  }

  return {
    src: w480,
    srcSet: `${w480} 480w, ${w800} 800w, ${resolved} 1200w`,
    sizes: "(max-width: 767px) 100vw, 50vw",
    preloadHref: w480,
  };
}
