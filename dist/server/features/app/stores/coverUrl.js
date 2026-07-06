function slugToSeed(slug) {
  let hash = 0;
  for (const char of slug) {
    hash = hash * 31 + char.charCodeAt(0) >>> 0;
  }
  return hash % 1e7 + 1;
}
function getStoreCoverUrl(slug) {
  return `https://static.photos/textures/1024x576/${slugToSeed(slug)}`;
}
function resolveStoreCoverUrl(store) {
  return store.bannerUrl?.trim() || store.coverUrl?.trim() || getStoreCoverUrl(store.slug);
}
export {
  getStoreCoverUrl,
  resolveStoreCoverUrl
};
