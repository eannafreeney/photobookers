import { nanoid } from "nanoid";
import { db } from "../../../../db/client";
import {
  books,
  Creator,
  CreatorClaim,
  creatorClaims,
  creators,
  User,
  users,
} from "../../../../db/schema";
import { and, count, desc, eq, gt, inArray, or, sql } from "drizzle-orm";
import { deleteBookByIdAdmin } from "../books/services";
import { err, ok } from "../../../../lib/result";

export const getPendingClaimsCount = async () => {
  try {
    const [row] = await db
      .select({ value: count() })
      .from(creatorClaims)
      .where(eq(creatorClaims.status, "pending_admin_review"));
    return ok(Number(row?.value ?? 0));
  } catch (error) {
    console.error("Failed to get pending claims count:", error);
    return err({ reason: "Failed to get pending claims count", cause: error });
  }
};

export const assignUserAsCreatorOwnerAdmin = async (
  userId: string,
  creatorId: string,
  isVerified?: boolean,
) => {
  try {
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) {
      return err({ reason: "User not found", cause: undefined });
    }
    const [updatedCreator] = await db
      .update(creators)
      .set({
        ownerUserId: userId,
        status: isVerified ? "verified" : "stub",
        email: user.email,
        ...(isVerified
          ? { verifiedAt: sql`COALESCE(${creators.verifiedAt}, NOW())` }
          : { verifiedAt: null }),
      })
      .where(eq(creators.id, creatorId))
      .returning();
    if (!updatedCreator) {
      return err({ reason: "Creator not found", cause: undefined });
    }
    return ok(updatedCreator);
  } catch (error) {
    console.error("Failed to assign user as creator owner admin:", error);
    return err({
      reason: "Failed to assign user as creator owner admin",
      cause: error,
    });
  }
};

export async function getClaimsPendingAdminReview(): Promise<
  Array<{ claim: CreatorClaim; creator: Creator; user: User }>
> {
  const claims = await db
    .select()
    .from(creatorClaims)
    .where(eq(creatorClaims.status, "pending_admin_review"))
    .orderBy(desc(creatorClaims.requestedAt));

  const creatorIds = [...new Set(claims.map((c) => c.creatorId))];
  const userIds = [...new Set(claims.map((c) => c.userId))];

  const [creatorsWithClaims, usersWithClaims] = await Promise.all([
    creatorIds.length > 0
      ? db.select().from(creators).where(inArray(creators.id, creatorIds))
      : Promise.resolve([]),
    userIds.length > 0
      ? db.select().from(users).where(inArray(users.id, userIds))
      : Promise.resolve([]),
  ]);

  const creatorById = new Map(creatorsWithClaims.map((c) => [c.id, c]));
  const userById = new Map(usersWithClaims.map((u) => [u.id, u]));

  return claims
    .map((claim) => ({
      claim,
      creator: creatorById.get(claim.creatorId),
      user: userById.get(claim.userId),
    }))
    .filter(
      (row): row is { claim: CreatorClaim; creator: Creator; user: User } =>
        row.creator != null && row.user != null,
    );
}

export const getClaimById = async (claimId: string) => {
  const [claim] = await db
    .select()
    .from(creatorClaims)
    .where(eq(creatorClaims.id, claimId))
    .limit(1);
  return claim ?? null;
};

export const approveClaim = async (claimId: string) => {
  try {
    const [claim] = await db
      .update(creatorClaims)
      .set({ status: "approved", verifiedAt: new Date() })
      .where(eq(creatorClaims.id, claimId))
      .returning();

    const isVerified = claim.status === "approved";

    const [creatorError, updatedCreator] = await assignUserAsCreatorOwnerAdmin(
      claim.userId,
      claim.creatorId,
      isVerified,
    );
    if (creatorError)
      return err({ reason: creatorError.reason, cause: creatorError.cause });
    return ok(updatedCreator);
  } catch (error) {
    console.error("Failed to approve claim:", error);
    return err({ reason: "Failed to approve claim", cause: error });
  }
};

export const rejectClaim = async (claimId: string) => {
  try {
    const [claim] = await db
      .select()
      .from(creatorClaims)
      .where(eq(creatorClaims.id, claimId))
      .limit(1);

    if (!claim) {
      return err({ reason: "Claim not found", cause: undefined });
    }

    await db
      .update(creatorClaims)
      .set({ status: "rejected" })
      .where(eq(creatorClaims.id, claimId));

    const [creator] = await db
      .select()
      .from(creators)
      .where(eq(creators.id, claim.creatorId))
      .limit(1);
    if (creator?.ownerUserId === claim.userId) {
      await db
        .update(creators)
        .set({ ownerUserId: null, website: null })
        .where(eq(creators.id, claim.creatorId));
    }

    try {
      const creatorBookCondition = or(
        eq(books.publisherId, claim.creatorId),
        eq(books.artistId, claim.creatorId),
      );
      const createdByClaimant = eq(books.createdByUserId, claim.userId);
      const createdAfterClaim = claim.verifiedAt
        ? gt(books.createdAt, claim.verifiedAt)
        : undefined;
      const booksToDeleteWhere = createdAfterClaim
        ? and(creatorBookCondition, createdByClaimant, createdAfterClaim)
        : and(creatorBookCondition, createdByClaimant);

      const booksToDelete = await db
        .select({ id: books.id })
        .from(books)
        .where(booksToDeleteWhere);

      for (const { id } of booksToDelete) {
        await deleteBookByIdAdmin(id);
      }
    } catch (error) {
      console.error(
        "Failed to delete claimant books on claim rejection:",
        error,
      );
    }

    return ok(undefined);
  } catch (error) {
    console.error("Failed to reject claim:", error);
    return err({ reason: "Failed to reject claim", cause: error });
  }
};
