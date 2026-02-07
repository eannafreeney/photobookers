import { db } from "../db/client";
import { Creator, CreatorClaim, creatorClaims, creators } from "../db/schema";
import { and, eq } from "drizzle-orm";
import {
  generateVerificationCode,
  getCodeExpiration,
  isCodeExpired,
  verifyWebsite,
} from "./verification";
import { nanoid } from "nanoid";
import { AuthUser } from "../../types";

export const getClaimByToken = async (token: string) => {
  const [claim] = await db
    .select()
    .from(creatorClaims)
    .where(eq(creatorClaims.verificationToken, token))
    .limit(1);
  return claim ?? null;
};

export const updateCreatorOwnerAndStatus = async (claimant: CreatorClaim) => {
  await db
    .update(creators)
    .set({ ownerUserId: claimant.userId, status: "verified" })
    .where(eq(creators.id, claimant.creatorId));
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
  // Check if code is expired
  if (isCodeExpired(claim.codeExpiresAt)) {
    await db
      .update(creatorClaims)
      .set({ status: "failed" })
      .where(eq(creatorClaims.id, claim.id));

    return {
      verified: false,
      error: "Verification code has expired. Please request a new one.",
    };
  }

  // Verify website contains code
  if (claim.verificationMethod === "website" && claim.verificationUrl) {
    const result = await verifyWebsite(
      claim.verificationUrl,
      claim.verificationCode!,
    );

    if (result.verified) {
      // Update claim status and verified timestamp
      await db
        .update(creatorClaims)
        .set({
          status: "success",
          verifiedAt: new Date(),
        })
        .where(eq(creatorClaims.id, claim.id));

      // Update creator ownership
      await updateCreatorOwnerAndStatus(claim);

      return { verified: true };
    }

    return result;
  }

  return {
    verified: false,
    error: "Invalid verification method",
  };
};

export const generateEmailHtml = async (
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
              <li><code>&lt;meta name="verification-code" content="${claim.verificationCode}"&gt;</code></li>
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

// Add this (use existing db/schema imports as in the file)
export const getPendingClaimByUserAndCreator = async (
  userId: string,
  creatorId: string,
) => {
  const [claim] = await db
    .select()
    .from(creatorClaims)
    .where(
      and(
        eq(creatorClaims.userId, userId),
        eq(creatorClaims.creatorId, creatorId),
        eq(creatorClaims.status, "pending"),
      ),
    )
    .limit(1);
  return claim ?? null;
};
