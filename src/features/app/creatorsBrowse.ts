export const CREATOR_CATALOG_TARGET_ID = "creators-catalog";

export const CREATOR_BROWSE_FILTERS = [
  "all",
  "artist",
  "publisher",
  "following",
] as const;

export type CreatorBrowseFilter = (typeof CREATOR_BROWSE_FILTERS)[number];

export function parseCreatorBrowseFilter(
  raw: string | undefined,
  isLoggedIn: boolean,
): CreatorBrowseFilter {
  if (raw === "artist" || raw === "publisher") return raw;
  if (raw === "following" && isLoggedIn) return "following";
  return "all";
}

export function creatorsBrowseUrl(
  filter: CreatorBrowseFilter,
  options?: { page?: number; fragment?: boolean },
): string {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("type", filter);
  if (options?.page && options.page > 1) {
    params.set("page", String(options.page));
  }
  if (options?.fragment) params.set("fragment", "catalog");
  const qs = params.toString();
  return qs ? `/creators?${qs}` : "/creators";
}

export const creatorBrowseFilterLabels: Record<
  Exclude<CreatorBrowseFilter, "all">,
  string
> = {
  artist: "Artists",
  publisher: "Publishers",
  following: "Following",
};
