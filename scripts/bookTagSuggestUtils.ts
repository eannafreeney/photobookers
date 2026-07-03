import { DISCOVER_TAGS } from "../src/constants/discover";

export const DISCOVER_TAG_SET = new Set(
  DISCOVER_TAGS.map((tag) => tag.toLowerCase()),
);

export function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, " ");
}

export function filterThemeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of tags) {
    const tag = normalizeTag(raw);
    if (!tag || !DISCOVER_TAG_SET.has(tag) || seen.has(tag)) continue;
    seen.add(tag);
    result.push(tag);
  }
  return result.sort((a, b) => a.localeCompare(b));
}

export function filterGeoTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of tags) {
    const tag = normalizeTag(raw);
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    result.push(tag);
  }
  return result.sort((a, b) => a.localeCompare(b));
}

/** Merge existing tags with new theme + geo tags; never removes existing. */
export function mergeBookTags(
  existing: string[] | null | undefined,
  themeTags: string[],
  geoTags: string[],
): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const raw of [...(existing ?? []), ...themeTags, ...geoTags]) {
    const tag = normalizeTag(raw);
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    merged.push(tag);
  }
  return merged;
}

export function tagsEqual(a: string[] | null | undefined, b: string[]): boolean {
  const left = [...(a ?? [])].map(normalizeTag).filter(Boolean).sort();
  const right = b.map(normalizeTag).filter(Boolean).sort();
  if (left.length !== right.length) return false;
  return left.every((tag, index) => tag === right[index]);
}

export function runBookTagSuggestSelfCheck(): void {
  const merged = mergeBookTags(["Japan", "custom"], ["urban"], ["tokyo", "japan"]);
  if (!merged.includes("japan") || !merged.includes("tokyo") || !merged.includes("urban")) {
    throw new Error("mergeBookTags failed to preserve and merge tags");
  }
  if (!merged.includes("custom")) {
    throw new Error("mergeBookTags dropped existing tag");
  }
  if (filterThemeTags(["Urban", "tokyo", "not-a-tag"]).join(",") !== "urban") {
    throw new Error("filterThemeTags failed");
  }
  if (tagsEqual(["japan", "urban"], merged)) {
    throw new Error("tagsEqual should be false for different sets");
  }
}
