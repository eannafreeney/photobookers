import { and, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { db } from "../db/client";
import {
  Book,
  books,
  Creator,
  CreatorClaim,
  creatorClaims,
  creators,
} from "../db/schema";

export const getAllCreatorProfilesAdmin = async (
  searchQuery?: string,
): Promise<Creator[]> => {
  return await db.query.creators.findMany({
    where: and(
      searchQuery ? ilike(creators.displayName, `%${searchQuery}%`) : undefined,
    ),
  });
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

export const getAllBooksAdmin = async (
  searchQuery?: string,
): Promise<Book[]> => {
  let creatorIds: string[] = [];
  if (searchQuery) {
    const rows = await db
      .select({ id: creators.id })
      .from(creators)
      .where(ilike(creators.displayName, `%${searchQuery}%`));
    creatorIds = rows.map((r) => r.id);
  }

  return await db.query.books.findMany({
    where:
      searchQuery && searchQuery.trim() !== ""
        ? creatorIds.length > 0
          ? or(
              ilike(books.title, `%${searchQuery}%`),
              inArray(books.artistId, creatorIds),
              inArray(books.publisherId, creatorIds),
            )
          : ilike(books.title, `%${searchQuery}%`)
        : undefined,
    orderBy: (books, { desc }) => [desc(books.createdAt)],
    with: {
      artist: true,
      publisher: true,
    },
  });
};

export const deleteBookByIdAdmin = async (bookId: string) => {
  try {
    const [deletedBook] = await db
      .delete(books)
      .where(eq(books.id, bookId))
      .returning();
    return deletedBook;
  } catch (error) {
    console.error("Failed to delete book", error);
    return null;
  }
};

export const deleteCreatorByIdAdmin = async (creatorId: string) => {
  try {
    const [deletedCreator] = await db
      .delete(creators)
      .where(eq(creators.id, creatorId))
      .returning();
    return deletedCreator;
  } catch (error) {
    console.error("Failed to delete creator", error);
    return null;
  }
};
