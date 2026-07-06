const EDITORIAL_REFERER_PATHS = [
  "/featured",
  "/book-of-the-day",
  "/artist-of-the-week",
  "/publisher-of-the-week",
  "/this-week",
  "/interviews",
  "/newsletter"
];
function isEditorialReferer(referer) {
  if (!referer?.trim()) return false;
  const lower = referer.toLowerCase();
  return EDITORIAL_REFERER_PATHS.some((path) => lower.includes(path));
}
export {
  EDITORIAL_REFERER_PATHS,
  isEditorialReferer
};
