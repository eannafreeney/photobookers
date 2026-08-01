function resolveSpotlightCopy(spotlightBlurb, fallback) {
  const copy = spotlightBlurb?.trim();
  if (copy) return copy;
  const fb = fallback?.trim();
  return fb || null;
}
export {
  resolveSpotlightCopy
};
