import { count, eq } from "drizzle-orm";
import { db } from "../../db/client";
import { fairViews, type FairViewSource } from "../../db/schema";
import { err, ok } from "../../lib/result";

const MAX_REFERER_LENGTH = 512;

export type RecordFairViewInput = {
  fairId: string;
  userId?: string | null;
  source?: FairViewSource;
  referer?: string | null;
};

export const recordFairView = async ({
  fairId,
  userId,
  source = "web",
  referer,
}: RecordFairViewInput) => {
  try {
    const trimmedReferer = referer?.trim().slice(0, MAX_REFERER_LENGTH) ?? null;
    await db.insert(fairViews).values({
      fairId,
      userId: userId ?? null,
      source,
      referer: trimmedReferer,
    });
    return ok(undefined);
  } catch (error) {
    console.error("Failed to record fair view", error);
    return err({ reason: "Failed to record fair view", cause: error });
  }
};

export const findFairViewCount = async (fairId: string) => {
  const result = await db
    .select({ value: count() })
    .from(fairViews)
    .where(eq(fairViews.fairId, fairId));
  return result[0]?.value ?? 0;
};
