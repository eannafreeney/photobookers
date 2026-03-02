import { nanoid } from "nanoid";
import { db } from "../../../../db/client";
import { CreatorClaim, creatorClaims, creators } from "../../../../db/schema";
import { eq } from "drizzle-orm";

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
