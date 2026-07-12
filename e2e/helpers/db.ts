import { drizzle } from "drizzle-orm/postgres-js";
import { and, eq, inArray, or } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "../../src/db/schema";

const {
  adminNotifications,
  bookComments,
  books,
  bookFairs,
  creatorClaims,
  creatorInterviews,
  creators,
  creatorViews,
  fairViews,
  users,
  wishlists,
} = schema;

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getE2eDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required for e2e tests");

  if (!db) {
    const client = postgres(url, { max: 1 });
    db = drizzle(client, { schema });
  }

  return db;
}

export async function getCreatorById(creatorId: string) {
  return getE2eDb().query.creators.findFirst({
    where: eq(creators.id, creatorId),
  });
}

export async function getClaimForUserAndCreator(
  userId: string,
  creatorId: string,
) {
  return getE2eDb().query.creatorClaims.findFirst({
    where: and(
      eq(creatorClaims.userId, userId),
      eq(creatorClaims.creatorId, creatorId),
    ),
  });
}

export async function hasWishlistEntry(userId: string, bookId: string) {
  const entry = await getE2eDb().query.wishlists.findFirst({
    where: and(eq(wishlists.userId, userId), eq(wishlists.bookId, bookId)),
  });
  return Boolean(entry);
}

export async function getBookPublicationStatus(bookId: string) {
  const book = await getE2eDb().query.books.findFirst({
    columns: { publicationStatus: true },
    where: eq(books.id, bookId),
  });
  return book?.publicationStatus ?? null;
}

export async function deleteTestData(opts: {
  userIds?: string[];
  creatorIds?: string[];
  bookIds?: string[];
  fairIds?: string[];
  interviewIds?: string[];
}) {
  const dbConn = getE2eDb();
  const userIds = opts.userIds ?? [];
  const creatorIds = opts.creatorIds ?? [];
  const bookIds = opts.bookIds ?? [];
  const fairIds = opts.fairIds ?? [];
  const interviewIds = opts.interviewIds ?? [];

  if (interviewIds.length > 0) {
    await dbConn
      .delete(creatorInterviews)
      .where(inArray(creatorInterviews.id, interviewIds));
  }

  if (bookIds.length > 0) {
    await dbConn.delete(bookComments).where(inArray(bookComments.bookId, bookIds));
    await dbConn.delete(books).where(inArray(books.id, bookIds));
  }

  if (fairIds.length > 0) {
    await dbConn.delete(fairViews).where(inArray(fairViews.fairId, fairIds));
    await dbConn.delete(bookFairs).where(inArray(bookFairs.id, fairIds));
  }

  if (userIds.length > 0 && creatorIds.length > 0) {
    await dbConn
      .delete(creatorClaims)
      .where(
        or(
          inArray(creatorClaims.userId, userIds),
          inArray(creatorClaims.creatorId, creatorIds),
        ),
      );
  } else if (userIds.length > 0) {
    await dbConn
      .delete(creatorClaims)
      .where(inArray(creatorClaims.userId, userIds));
  } else if (creatorIds.length > 0) {
    await dbConn
      .delete(creatorClaims)
      .where(inArray(creatorClaims.creatorId, creatorIds));
  }

  if (creatorIds.length > 0) {
    await dbConn
      .delete(creatorViews)
      .where(inArray(creatorViews.creatorId, creatorIds));
    await dbConn.delete(creators).where(inArray(creators.id, creatorIds));
  }

  if (userIds.length > 0) {
    await dbConn
      .delete(adminNotifications)
      .where(inArray(adminNotifications.actorUserId, userIds));
    await dbConn.delete(users).where(inArray(users.id, userIds));
  }
}
