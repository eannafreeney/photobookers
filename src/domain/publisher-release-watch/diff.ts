import type { WatchedProduct } from "./watchlist";

export type PublisherDiffResult = {
  /** True when this publisher had no prior snapshot (first run). */
  seeded: boolean;
  newProducts: WatchedProduct[];
};

/**
 * Compare current catalogue products to previously seen keys.
 * First run (empty seen set) seeds without treating items as "new".
 */
export function diffPublisherProducts(
  current: WatchedProduct[],
  seenKeys: ReadonlySet<string>,
): PublisherDiffResult {
  if (seenKeys.size === 0) {
    return { seeded: true, newProducts: [] };
  }

  const newProducts = current.filter((p) => !seenKeys.has(p.key));
  return { seeded: false, newProducts };
}
