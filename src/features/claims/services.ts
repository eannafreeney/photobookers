import { nanoid } from "nanoid";
import { db } from "../../db/client";
import { creatorClaims } from "../../db/schema";
import {
  generateVerificationCode,
  getCodeExpiration,
} from "../../services/verification";
import { eq } from "drizzle-orm";

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
