import { nanoid } from "nanoid";
import { db } from "../../../../db/client";
import {
  books,
  Creator,
  CreatorClaim,
  creatorClaims,
  creators,
} from "../../../../db/schema";
import { and, count, desc, eq, gt, ilike, inArray, or } from "drizzle-orm";
import { deleteBookByIdAdmin } from "../books/services";
import { getPagination } from "../../../../lib/pagination";

export const assignCreatorToUserAdmin = async (
  userId: string,
  creatorId: string,
  websiteUrl?: string | null,
) => {
  const verificationToken = nanoid(32);
  const [claim] = await db
    .insert(creatorClaims)
    .values({
      userId,
      creatorId,
      verificationToken,
      verificationMethod: "website",
      verificationUrl: websiteUrl ?? null,
      status: "approved",
      verifiedAt: new Date(),
    })
    .returning();

  if (!claim) return null;
  await updateCreatorOwnerAndStatus(claim);
  return claim;
};

export const updateCreatorOwnerAndStatus = async (claim: CreatorClaim) => {
  await db
    .update(creators)
    .set({
      ownerUserId: claim.userId,
      status: "verified",
      website: claim.verificationUrl,
    })
    .where(eq(creators.id, claim.creatorId));
};

export async function getClaimsPendingAdminReview(
  searchQuery?: string,
): Promise<Array<{ claim: CreatorClaim; creator: Creator }>> {
  const claims = await db
    .select()
    .from(creatorClaims)
    .where(
      and(
        searchQuery
          ? ilike(creatorClaims.status, `%${searchQuery}%`)
          : undefined,
        eq(creatorClaims.status, "pending_admin_review"),
      ),
    )
    .orderBy(desc(creatorClaims.requestedAt));

  const creatorIds = [...new Set(claims.map((c) => c.creatorId))];
  const creatorsWithClaims =
    creatorIds.length > 0
      ? await db.select().from(creators).where(inArray(creators.id, creatorIds))
      : [];

  const creatorById = new Map(creatorsWithClaims.map((c) => [c.id, c]));

  return claims
    .map((claim) => ({
      claim,
      creator: creatorById.get(claim.creatorId),
    }))
    .filter(
      (row): row is { claim: CreatorClaim; creator: Creator } =>
        row.creator != null,
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

    await updateCreatorOwnerAndStatus(claim);
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
