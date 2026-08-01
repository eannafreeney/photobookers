import { eq } from "drizzle-orm";
import { publisherReleaseWatchSeen } from "../../db/schema";
import { db } from "../../db/client";
import type { WatchedProduct } from "./watchlist";

export async function getSeenProductKeys(
  publisherId: string,
): Promise<Set<string>> {
  const rows = await db
    .select({ productKey: publisherReleaseWatchSeen.productKey })
    .from(publisherReleaseWatchSeen)
    .where(eq(publisherReleaseWatchSeen.publisherId, publisherId));

  return new Set(rows.map((r) => r.productKey));
}

export async function insertSeenProducts(
  publisherId: string,
  products: WatchedProduct[],
): Promise<number> {
  if (products.length === 0) return 0;

  const rows = products.map((p) => ({
    publisherId,
    productKey: p.key,
    title: p.title,
    url: p.url,
  }));

  const CHUNK = 100;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const result = await db
      .insert(publisherReleaseWatchSeen)
      .values(chunk)
      .onConflictDoNothing({
        target: [
          publisherReleaseWatchSeen.publisherId,
          publisherReleaseWatchSeen.productKey,
        ],
      })
      .returning({ id: publisherReleaseWatchSeen.id });
    inserted += result.length;
  }
  return inserted;
}
