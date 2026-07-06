const SUPABASE_OBJECT_PREFIX = "/storage/v1/object/public/";
function supabaseRenderImageUrl(url, { width, quality = 75 }) {
  try {
    const parsed = new URL(url);
    const prefixIndex = parsed.pathname.indexOf(SUPABASE_OBJECT_PREFIX);
    if (prefixIndex === -1) return url;
    const bucketPath = parsed.pathname.slice(
      prefixIndex + SUPABASE_OBJECT_PREFIX.length
    );
    parsed.pathname = `/storage/v1/render/image/public/${bucketPath}`;
    parsed.search = `width=${width}&quality=${quality}`;
    return parsed.toString();
  } catch {
    return url;
  }
}
function heroLcpImageSources(url) {
  const w480 = supabaseRenderImageUrl(url, { width: 480 });
  const w800 = supabaseRenderImageUrl(url, { width: 800 });
  if (w480 === url) {
    return {
      src: url,
      srcSet: url,
      sizes: "100vw",
      preloadHref: url
    };
  }
  return {
    src: w480,
    srcSet: `${w480} 480w, ${w800} 800w, ${url} 1200w`,
    sizes: "(max-width: 767px) 100vw, 50vw",
    preloadHref: w480
  };
}
export {
  heroLcpImageSources,
  supabaseRenderImageUrl
};
