const SUPABASE_OBJECT_PREFIX = "/storage/v1/object/public/";

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
