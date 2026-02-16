import { db } from "../db/client";
import {
  books,
  Creator,
  CreatorClaim,
  creatorClaims,
  creators,
} from "../db/schema";
import { and, desc, eq, gt, inArray, or } from "drizzle-orm";
import {
  generateVerificationCode,
  getCodeExpiration,
  getHostname,
  isCodeExpired,
  verifyWebsite,
} from "./verification";
import { nanoid } from "nanoid";
import { AuthUser } from "../../types";
import { getCreatorById } from "./creators";
import { getUserById } from "./users";
import { deleteBookById } from "./books";

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
          await deleteBookById(id);
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

export const getClaimByToken = async (token: string) => {
  const [claim] = await db
    .select()
    .from(creatorClaims)
    .where(eq(creatorClaims.verificationToken, token))
    .limit(1);
  return claim ?? null;
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

export const assignCreatorToClaimant = async (claim: CreatorClaim) => {
  await db
    .update(creators)
    .set({
      ownerUserId: claim.userId,
      website: claim.verificationUrl,
    })
    .where(eq(creators.id, claim.creatorId));
};

export const deleteClaim = async (claimId: string) => {
  try {
    await db.delete(creatorClaims).where(eq(creatorClaims.id, claimId));
  } catch (error) {
    console.error("Failed to delete claim", error);
    return null;
  }
};

export const createClaim = async (
  userId: string,
  creatorId: string,
  verificationUrl: string,
  verificationMethod: "website" | "instagram" = "website",
) => {
  const verificationCode = generateVerificationCode();
  const codeExpiresAt = getCodeExpiration(7); // 7 days
  const verificationToken = nanoid(32); // For email verification link

  const [claim] = await db
    .insert(creatorClaims)
    .values({
      userId,
      creatorId,
      verificationToken,
      verificationMethod,
      verificationUrl,
      verificationCode,
      codeExpiresAt,
      status: "pending",
    })
    .returning();

  return claim;
};

export const verifyClaim = async (claim: CreatorClaim) => {
  if (isCodeExpired(claim.codeExpiresAt)) {
    await db
      .update(creatorClaims)
      .set({ status: "rejected" })
      .where(eq(creatorClaims.id, claim.id));

    return {
      verified: false,
      error: "Verification code has expired. Please request a new one.",
      requiresApproval: false,
    };
  }

  if (claim.verificationMethod !== "website" || !claim.verificationUrl) {
    return {
      verified: false,
      error: "Invalid verification method",
      requiresApproval: false,
    };
  }

  const result = await verifyWebsite(
    claim.verificationUrl,
    claim.verificationCode!,
  );

  if (!result.verified) {
    return result;
  }

  const creator = await getCreatorById(claim.creatorId);
  const websiteHost = getHostname(claim.verificationUrl);

  // Existing creator already had this website on file → auto-approve (claim flow)
  if (creator?.website) {
    await db
      .update(creatorClaims)
      .set({
        status: "approved",
        verifiedAt: new Date(),
      })
      .where(eq(creatorClaims.id, claim.id));
    await updateCreatorOwnerAndStatus(claim);
    return { verified: true, error: null, requiresApproval: false };
  }

  // New creator: same domain for email and website → auto-approve; else pending_admin_review
  const user = await getUserById(claim.userId);
  if (!user) {
    return {
      verified: false,
      error: "User not found",
      requiresApproval: false,
    };
  }
  const emailDomain = user?.email?.split("@")[1]?.toLowerCase() ?? "";
  const domainsMatch = emailDomain.length > 0 && emailDomain === websiteHost;

  if (domainsMatch) {
    await db
      .update(creatorClaims)
      .set({
        status: "approved",
        verifiedAt: new Date(),
      })
      .where(eq(creatorClaims.id, claim.id));
    await updateCreatorOwnerAndStatus(claim);
    return { verified: true, error: null, requiresApproval: false };
  }

  // New creator: different domain for email and website → pending admin review
  await db
    .update(creatorClaims)
    .set({
      status: "pending_admin_review",
      verifiedAt: new Date(),
    })
    .where(eq(creatorClaims.id, claim.id));
  await assignCreatorToClaimant(claim);
  return { verified: true, error: null, requiresApproval: true };
};

export const generateClaimEmail = async (
  claim: CreatorClaim,
  user: AuthUser,
  creator: Creator,
  verificationUrl: string,
  verificationLink: string,
) => {
  return `
        <h2>Verify Your Creator Profile Claim</h2>
        <p>Hello ${user?.firstName},</p>
        <p>You've requested to claim the creator profile for <strong>${creator.displayName}</strong>.</p>
        
        <h3>Your Verification Code:</h3>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; padding: 20px; background: #f5f5f5; text-align: center;">
          ${claim.verificationCode}
        </p>
        
        <h3>Next Steps:</h3>
        <ol>
          <li>Add this code to your website (${verificationUrl}) in one of these ways:
            <ul>
              <li>Add it as visible text on your homepage</li>
              <li>Add the line below as a meta tag:</li>
              <li><code>&lt;meta name="photobookers-verification-code" content="${claim.verificationCode}"&gt;</code></li>
            </ul>
          </li>
          <li>Once added, click the button below to verify:</li>
          <li>Once verified, you will be able to manage your creator profile from your dashboard.</li>
        </ol>
        
        <p>
          <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">
            Verify My Website
          </a>
        </p>
        
        <p><small>This code expires in 7 days. If you need a new code, please submit a new claim.</small></p>
      `;
};

export const generateClaimApprovalEmail = async (
  user: AuthUser,
  creator: Creator,
) => {
  return `
        <h2>Your Creator Profile Claim has been approved!</h2>
        <p>Hello ${user?.firstName},</p>
        <p>Your claim for the creator profile for <strong>${creator.displayName}</strong> has been approved.</p>
        <p>You can now start uploading books and editing your profile.</p>

      `;
};

export const generateClaimRejectionEmail = async (
  user: AuthUser,
  creator: Creator,
) => {
  return `
        <h2>Your Creator Profile Claim has been rejected</h2>
        <p>Hello ${user?.firstName},</p>
        <p>Your claim for the creator profile for <strong>${creator.displayName}</strong> has been rejected.</p>
        <p>Please try again.</p>
      `;
};

// Add this (use existing db/schema imports as in the file)
export const getPendingClaimByUserAndCreator = async (
  userId: string,
  creatorId: string,
) => {
  if (!userId || !creatorId) return null;

  const [claim] = await db
    .select()
    .from(creatorClaims)
    .where(
      and(
        eq(creatorClaims.userId, userId),
        eq(creatorClaims.creatorId, creatorId),
        inArray(creatorClaims.status, ["pending", "pending_admin_review"]),
      ),
    )
    .limit(1);
  return claim ?? null;
};
