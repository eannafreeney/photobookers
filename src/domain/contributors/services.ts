import { and, count, desc, eq } from "drizzle-orm";
import { db } from "../../db/client";
import { books, users } from "../../db/schema";
import {
  BOOK_CARD_COLUMNS,
  CREATOR_CARD_COLUMNS,
} from "../../constants/queries";
import { err, ok } from "../../lib/result";

export async function getPublishedContributionsByUserId(userId: string) {
  return db.query.books.findMany({
    columns: BOOK_CARD_COLUMNS,
    with: {
      artist: { columns: CREATOR_CARD_COLUMNS },
      publisher: { columns: CREATOR_CARD_COLUMNS },
    },
    where: and(
      eq(books.submittedByUserId, userId),
      eq(books.publicationStatus, "published"),
      eq(books.approvalStatus, "approved"),
    ),
    orderBy: [desc(books.createdAt)],
  });
}

export async function getContributorByShelfSlug(slug: string) {
  const user = await db.query.users.findFirst({
    columns: {
      id: true,
      firstName: true,
      lastName: true,
      profileImageUrl: true,
      shelfSlug: true,
    },
    where: eq(users.shelfSlug, slug),
  });

  if (!user) return err({ reason: "Contributor not found" });

  const submittedBooks = await getPublishedContributionsByUserId(user.id);

  return ok({ contributor: user, books: submittedBooks });
}

export type SubmittedBook = Awaited<ReturnType<typeof getSubmittedBooksByUserId>>[number];

export async function getSubmittedBooksByUserId(userId: string) {
  return db.query.books.findMany({
    with: {
      artist: true,
      publisher: true,
    },
    where: eq(books.submittedByUserId, userId),
    orderBy: [desc(books.createdAt)],
  });
}

export async function hasSubmittedBooks(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ value: count() })
    .from(books)
    .where(eq(books.submittedByUserId, userId));
  return Number(row.value) > 0;
}

export type LeaderboardEntry = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  shelfSlug: string | null;
  bookCount: number;
};

export async function getContributorLeaderboard(): Promise<LeaderboardEntry[]> {
  const rows = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      profileImageUrl: users.profileImageUrl,
      shelfSlug: users.shelfSlug,
      bookCount: count(books.id),
    })
    .from(users)
    .innerJoin(
      books,
      and(
        eq(books.submittedByUserId, users.id),
        eq(books.publicationStatus, "published"),
        eq(books.approvalStatus, "approved"),
      ),
    )
    .groupBy(users.id)
    .orderBy(desc(count(books.id)));

  return rows.map((r) => ({ ...r, bookCount: Number(r.bookCount) }));
}
