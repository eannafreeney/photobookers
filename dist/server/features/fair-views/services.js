import { count, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { fairViews } from "../../db/schema.js";
import { err, ok } from "../../lib/result.js";
const MAX_REFERER_LENGTH = 512;
const recordFairView = async ({
  fairId,
  userId,
  source = "web",
  referer
}) => {
  try {
    const trimmedReferer = referer?.trim().slice(0, MAX_REFERER_LENGTH) ?? null;
    await db.insert(fairViews).values({
      fairId,
      userId: userId ?? null,
      source,
      referer: trimmedReferer
    });
    return ok(void 0);
  } catch (error) {
    console.error("Failed to record fair view", error);
    return err({ reason: "Failed to record fair view", cause: error });
  }
};
const findFairViewCount = async (fairId) => {
  const result = await db.select({ value: count() }).from(fairViews).where(eq(fairViews.fairId, fairId));
  return result[0]?.value ?? 0;
};
export {
  findFairViewCount,
  recordFairView
};
