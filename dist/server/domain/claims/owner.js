import { count, eq, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { creatorClaims, creators, users } from "../../db/schema.js";
import { err, ok } from "../../lib/result.js";
const getPendingClaimsCount = async () => {
  try {
    const [row] = await db.select({ value: count() }).from(creatorClaims).where(eq(creatorClaims.status, "pending_admin_review"));
    return ok(Number(row?.value ?? 0));
  } catch (error) {
    console.error("Failed to get pending claims count:", error);
    return err({ reason: "Failed to get pending claims count", cause: error });
  }
};
const assignUserAsCreatorOwnerAdmin = async (userId, creatorId, isVerified) => {
  try {
    const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return err({ reason: "User not found", cause: void 0 });
    }
    const [updatedCreator] = await db.update(creators).set({
      ownerUserId: userId,
      status: isVerified ? "verified" : "stub",
      email: user.email,
      ...isVerified ? { verifiedAt: sql`COALESCE(${creators.verifiedAt}, NOW())` } : { verifiedAt: null }
    }).where(eq(creators.id, creatorId)).returning();
    if (!updatedCreator) {
      return err({ reason: "Creator not found", cause: void 0 });
    }
    return ok(updatedCreator);
  } catch (error) {
    console.error("Failed to assign user as creator owner admin:", error);
    return err({
      reason: "Failed to assign user as creator owner admin",
      cause: error
    });
  }
};
export {
  assignUserAsCreatorOwnerAdmin,
  getPendingClaimsCount
};
