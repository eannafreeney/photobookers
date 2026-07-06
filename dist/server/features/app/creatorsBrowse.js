const CREATOR_CATALOG_TARGET_ID = "creators-catalog";
const CREATOR_BROWSE_FILTERS = [
  "all",
  "artist",
  "publisher",
  "following"
];
function parseCreatorBrowseFilter(raw, isLoggedIn) {
  if (raw === "artist" || raw === "publisher") return raw;
  if (raw === "following" && isLoggedIn) return "following";
  return "all";
}
function creatorsBrowseUrl(filter, options) {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("type", filter);
  if (options?.page && options.page > 1) {
    params.set("page", String(options.page));
  }
  if (options?.fragment) params.set("fragment", "catalog");
  const qs = params.toString();
  return qs ? `/creators?${qs}` : "/creators";
}
const creatorBrowseFilterLabels = {
  artist: "Artists",
  publisher: "Publishers",
  following: "Following"
};
export {
  CREATOR_BROWSE_FILTERS,
  CREATOR_CATALOG_TARGET_ID,
  creatorBrowseFilterLabels,
  creatorsBrowseUrl,
  parseCreatorBrowseFilter
};
