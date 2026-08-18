import { eq } from "drizzle-orm";
import { publisherReleaseWatchSeen } from "../../db/schema.js";
import { db } from "../../db/client.js";
async function getSeenProductKeys(publisherId) {
  const rows = await db.select({ productKey: publisherReleaseWatchSeen.productKey }).from(publisherReleaseWatchSeen).where(eq(publisherReleaseWatchSeen.publisherId, publisherId));
  return new Set(rows.map((r) => r.productKey));
}
async function insertSeenProducts(publisherId, products) {
  if (products.length === 0) return 0;
  const rows = products.map((p) => ({
    publisherId,
    productKey: p.key,
    title: p.title,
    url: p.url
  }));
  const CHUNK = 100;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const result = await db.insert(publisherReleaseWatchSeen).values(chunk).onConflictDoNothing({
      target: [
        publisherReleaseWatchSeen.publisherId,
        publisherReleaseWatchSeen.productKey
      ]
    }).returning({ id: publisherReleaseWatchSeen.id });
    inserted += result.length;
  }
  return inserted;
}
export {
  getSeenProductKeys,
  insertSeenProducts
};
