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
import { and, desc, eq, gt, ilike, inArray, or } from "drizzle-orm";
import { deleteBookByIdAdmin } from "../books/services";

export const assignUserAsCreatorOwnerAdmin = async (
  userId: string,
  creatorId: string,
  isVerified: boolean = false,
) => {
  await db
    .update(creators)
    .set({
      ownerUserId: userId,
      status: isVerified ? "verified" : "stub",
    })
    .where(eq(creators.id, creatorId));
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

    await assignUserAsCreatorOwnerAdmin(
      claim.userId,
      claim.creatorId,
      isVerified,
    );
    return claim;
  } catch (error) {
    console.error("Failed to approve claim:", error);
    throw error;
  }
};
export const rejectClaim = async (claimId: string) => {
  try {
    const [claim] = await db
      .select()
      .from(creatorClaims)
      .where(eq(creatorClaims.id, claimId))
      .limit(1);

    await db
      .update(creatorClaims)
      .set({ status: "rejected" })
      .where(eq(creatorClaims.id, claimId));

    if (claim) {
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
    }
  } catch (error) {
    console.error("Failed to reject claim:", error);
    throw error;
  }
};
