import { nanoid } from "nanoid";
import { db } from "../../db/client";
import {
  bookImages,
  books,
  CreatorClaim,
  creatorClaims,
  creators,
} from "../../db/schema";
import {
  generateVerificationCode,
  getCodeExpiration,
  getHostname,
  isCodeExpired,
  verifyWebsite,
} from "../../services/verification";
import { and, eq, gt, inArray, or } from "drizzle-orm";
import { cleanupOrphanedStubCreator } from "../dashboard/books/services";
import { getCreatorById } from "../dashboard/creators/services";
import { getUserByIdAdmin } from "../dashboard/admin/creators/services";
import { assignUserAsCreatorOwnerAdmin } from "../dashboard/admin/claims/services";
import { err, ok } from "../../lib/result";

export const getPendingClaim = async (userId: string, creatorId: string) => {
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

export const deleteClaim = async (claimId: string) => {
  try {
    await db.delete(creatorClaims).where(eq(creatorClaims.id, claimId));
  } catch (error) {
    console.error("Failed to delete claim", error);
    return null;
  }
};

// Add to src/features/claims/services.ts

export const createClaimWithStatus = async (
  userId: string,
  creatorId: string,
  verificationUrl: string,
  status: "approved" | "pending_admin_review",
) => {
  try {
    await db.insert(creatorClaims).values({
      userId,
      creatorId,
      verificationUrl,
      status,
      verifiedAt: status === "approved" ? new Date() : null,
    });
    return ok(undefined);
  } catch (error) {
    console.error("Failed to create claim:", error);
    return err({ reason: "Failed to create claim", cause: error });
  }
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

export const deleteBookById = async (bookId: string) => {
  try {
    const [book] = await db.select().from(books).where(eq(books.id, bookId));

    if (!book) return null;

    // Delete related book_images first (FK constraint)
    await db.delete(bookImages).where(eq(bookImages.bookId, bookId));

    const [deletedBook] = await db
      .delete(books)
      .where(eq(books.id, bookId))
      .returning();

    // Clean up orphaned stub publisher
    if (book.publisherId) {
      await cleanupOrphanedStubCreator(book.publisherId);
    }

    // Clean up orphaned stub artist
    if (book.artistId) {
      await cleanupOrphanedStubCreator(book.artistId);
    }

    return deletedBook;
  } catch (error) {
    console.error("Failed to delete book", error);
    return null;
  }
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
