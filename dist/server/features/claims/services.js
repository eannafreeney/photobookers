import { db } from "../../db/client.js";
import {
  bookImages,
  books,
  creatorClaims,
  creators
} from "../../db/schema.js";
import { and, eq, gt, inArray, or } from "drizzle-orm";
import { cleanupOrphanedStubCreator } from "../dashboard/books/services.js";
import { assignUserAsCreatorOwnerAdmin } from "../dashboard/admin/claims/services.js";
import { err, ok } from "../../lib/result.js";
import { invalidateBookCache } from "../app/services.js";
const getPendingClaim = async (userId, creatorId) => {
  if (!userId || !creatorId)
    return err({ reason: "Invalid user or creator ID" });
  try {
    const [claim] = await db.select().from(creatorClaims).where(
      and(
        eq(creatorClaims.userId, userId),
        eq(creatorClaims.creatorId, creatorId),
        inArray(creatorClaims.status, ["pending", "pending_admin_review"])
      )
    ).limit(1);
    return ok(claim ?? null);
  } catch (error) {
    console.error("Failed to get pending claim", error);
    return err({ reason: "Failed to get pending claim", cause: error });
  }
};
const deleteClaim = async (claimId) => {
  try {
    await db.delete(creatorClaims).where(eq(creatorClaims.id, claimId));
  } catch (error) {
    console.error("Failed to delete claim", error);
    return null;
  }
};
const createClaimWithStatus = async (userId, creatorId, verificationUrl, status) => {
  try {
    const [claim] = await db.insert(creatorClaims).values({
      userId,
      creatorId,
      verificationUrl: verificationUrl ?? null,
      status,
      verifiedAt: status === "approved" ? /* @__PURE__ */ new Date() : null
    }).returning();
    return ok(claim);
  } catch (error) {
    console.error("Failed to create claim:", error);
    return err({ reason: "Failed to create claim", cause: error });
  }
};
const approveClaim = async (claimId) => {
  try {
    const [claim] = await db.update(creatorClaims).set({ status: "approved", verifiedAt: /* @__PURE__ */ new Date() }).where(eq(creatorClaims.id, claimId)).returning();
    const isVerified = claim.status === "approved";
    await assignUserAsCreatorOwnerAdmin(
      claim.userId,
      claim.creatorId,
      isVerified
    );
    return claim;
  } catch (error) {
    console.error("Failed to approve claim:", error);
    throw error;
  }
};
const rejectClaim = async (claimId) => {
  try {
    const [claim] = await db.select().from(creatorClaims).where(eq(creatorClaims.id, claimId)).limit(1);
    await db.update(creatorClaims).set({ status: "rejected" }).where(eq(creatorClaims.id, claimId));
    if (claim) {
      const [creator] = await db.select().from(creators).where(eq(creators.id, claim.creatorId)).limit(1);
      if (creator?.ownerUserId === claim.userId) {
        await db.update(creators).set({ ownerUserId: null, website: null }).where(eq(creators.id, claim.creatorId));
      }
      try {
        const creatorBookCondition = or(
          eq(books.publisherId, claim.creatorId),
          eq(books.artistId, claim.creatorId)
        );
        const createdByClaimant = eq(books.createdByUserId, claim.userId);
        const createdAfterClaim = claim.verifiedAt ? gt(books.createdAt, claim.verifiedAt) : void 0;
        const booksToDeleteWhere = createdAfterClaim ? and(creatorBookCondition, createdByClaimant, createdAfterClaim) : and(creatorBookCondition, createdByClaimant);
        const booksToDelete = await db.select({ id: books.id }).from(books).where(booksToDeleteWhere);
        for (const { id } of booksToDelete) {
          await deleteBookById(id);
        }
      } catch (error) {
        console.error(
          "Failed to delete claimant books on claim rejection:",
          error
        );
      }
    }
  } catch (error) {
    console.error("Failed to reject claim:", error);
    throw error;
  }
};
const deleteBookById = async (bookId) => {
  try {
    const [book] = await db.select().from(books).where(eq(books.id, bookId));
    if (!book) return null;
    await db.delete(bookImages).where(eq(bookImages.bookId, bookId));
    const [deletedBook] = await db.delete(books).where(eq(books.id, bookId)).returning();
    if (deletedBook?.slug) {
      invalidateBookCache(deletedBook.slug);
    }
    if (book.publisherId) {
      await cleanupOrphanedStubCreator(book.publisherId);
    }
    if (book.artistId) {
      await cleanupOrphanedStubCreator(book.artistId);
    }
    return deletedBook;
  } catch (error) {
    console.error("Failed to delete book", error);
    return null;
  }
};
const assignCreatorToClaimant = async (claim) => {
  await db.update(creators).set({
    ownerUserId: claim.userId,
    website: claim.verificationUrl
  }).where(eq(creators.id, claim.creatorId));
};
export {
  approveClaim,
  assignCreatorToClaimant,
  createClaimWithStatus,
  deleteBookById,
  deleteClaim,
  getPendingClaim,
  rejectClaim
};
