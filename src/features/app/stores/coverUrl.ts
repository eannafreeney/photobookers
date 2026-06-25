function slugToSeed(slug: string): number {
  let hash = 0;
  for (const char of slug) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return (hash % 10_000_000) + 1;
}

export function getStoreCoverUrl(slug: string): string {
  return `https://static.photos/textures/1024x576/${slugToSeed(slug)}`;
}

export function resolveStoreCoverUrl(store: {
  slug: string;
  coverUrl?: string | null;
  bannerUrl?: string | null;
}): string {
  return (
    store.bannerUrl?.trim() ||
    store.coverUrl?.trim() ||
    getStoreCoverUrl(store.slug)
  );
}
