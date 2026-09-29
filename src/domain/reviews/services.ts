import { and, desc, eq, inArray, or } from "drizzle-orm";
import { db } from "../../db/client";
import {
  bookReviewAvailability,
  bookReviews,
  books,
  creators,
  reviewRequests,
  reviewerProfiles,
} from "../../db/schema";
import type { ReviewRequestStatus } from "../../db/schema";
import { err, ok } from "../../lib/result";
import { formatShelfOwnerName } from "../shelf/utils";
import {
  canTransitionReviewRequest,
  isBookCreator,
  requestStatusAfterReview,
} from "./policy";

const publishedBook = and(
  eq(books.publicationStatus, "published"),
  eq(books.approvalStatus, "approved"),
);

const reviewWithAuthor = {
  user: {
    columns: {
      id: true,
      firstName: true,
      lastName: true,
      shelfSlug: true,
      shelfPublic: true,
      profileImageUrl: true,
    },
    with: {
      reviewerProfile: {
        columns: { slug: true, displayName: true, website: true },
      },
    },
  },
  book: {
    columns: {
      id: true,
      slug: true,
      title: true,
      coverUrl: true,
    },
    with: {
      artist: { columns: { slug: true, displayName: true } },
      publisher: { columns: { slug: true, displayName: true } },
    },
  },
} as const;

export type PublicReview = NonNullable<
  Awaited<ReturnType<typeof listPublishedReviews>>[1]
>[number];

function ownerIds(book: {
  artist?: { ownerUserId: string | null } | null;
  publisher?: { ownerUserId: string | null } | null;
}) {
  return {
    artistOwnerUserId: book.artist?.ownerUserId,
    publisherOwnerUserId: book.publisher?.ownerUserId,
  };
}

export async function listPublishedReviews(limit = 40) {
  try {
    const rows = await db.query.bookReviews.findMany({
      orderBy: [desc(bookReviews.createdAt)],
      limit,
      with: reviewWithAuthor,
    });
    const visible = rows.filter(
      (row) =>
        row.book &&
        // relation filter isn't available without a where on the book;
        // drop unpublished by a follow-up check below.
        true,
    );
    const bookIds = visible.map((row) => row.bookId);
    if (bookIds.length === 0) return ok([]);
    const published = await db
      .select({ id: books.id })
      .from(books)
      .where(and(inArray(books.id, bookIds), publishedBook));
    const publishedIds = new Set(published.map((row) => row.id));
    const requestRows = await db
      .select({
        reviewId: reviewRequests.reviewId,
        status: reviewRequests.status,
      })
      .from(reviewRequests)
      .where(eq(reviewRequests.status, "reviewed"));
    const copyIds = new Set(
      requestRows.map((row) => row.reviewId).filter((id): id is string => !!id),
    );
    return ok(
      visible
        .filter((row) => publishedIds.has(row.bookId))
        .map((row) => ({ ...row, fromReviewCopy: copyIds.has(row.id) })),
    );
  } catch (error) {
    console.error("Failed to list reviews", error);
    return err({ reason: "Failed to load reviews" });
  }
}

export async function listReviewsForBook(bookId: string) {
  try {
    const rows = await db.query.bookReviews.findMany({
      where: eq(bookReviews.bookId, bookId),
      orderBy: [desc(bookReviews.createdAt)],
      with: reviewWithAuthor,
    });
    const requests = await db
      .select({ reviewId: reviewRequests.reviewId, status: reviewRequests.status })
      .from(reviewRequests)
      .where(
        and(eq(reviewRequests.bookId, bookId), eq(reviewRequests.status, "reviewed")),
      );
    const copyIds = new Set(
      requests.map((row) => row.reviewId).filter((id): id is string => !!id),
    );
    return ok(rows.map((row) => ({ ...row, fromReviewCopy: copyIds.has(row.id) })));
  } catch (error) {
    console.error("Failed to list book reviews", error);
    return err({ reason: "Failed to load reviews" });
  }
}

export async function listReviewsByUser(userId: string) {
  try {
    const rows = await db.query.bookReviews.findMany({
      where: eq(bookReviews.userId, userId),
      orderBy: [desc(bookReviews.createdAt)],
      with: reviewWithAuthor,
    });
    const requests = await db
      .select({ reviewId: reviewRequests.reviewId })
      .from(reviewRequests)
      .where(
        and(
          eq(reviewRequests.userId, userId),
          eq(reviewRequests.status, "reviewed"),
        ),
      );
    const copyIds = new Set(
      requests.map((row) => row.reviewId).filter((id): id is string => !!id),
    );
    return ok(
      rows.map((row) => ({ ...row, fromReviewCopy: copyIds.has(row.id) })),
    );
  } catch (error) {
    console.error("Failed to list user reviews", error);
    return err({ reason: "Failed to load reviews" });
  }
}

export async function getReviewerBySlug(slug: string) {
  try {
    const profile = await db.query.reviewerProfiles.findFirst({
      where: eq(reviewerProfiles.slug, slug),
      with: {
        user: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            shelfSlug: true,
            shelfPublic: true,
          },
        },
      },
    });
    if (!profile) return err({ reason: "Reviewer not found" });
    const [reviewsErr, reviews] = await listReviewsByUser(profile.userId);
    if (reviewsErr || !reviews) return err({ reason: reviewsErr?.reason ?? "Failed to load reviews" });
    return ok({ profile, reviews });
  } catch (error) {
    console.error("Failed to load reviewer", error);
    return err({ reason: "Failed to load reviewer" });
  }
}

export async function getReviewerProfile(userId: string) {
  try {
    const profile = await db.query.reviewerProfiles.findFirst({
      where: eq(reviewerProfiles.userId, userId),
    });
    return ok(profile ?? null);
  } catch (error) {
    console.error("Failed to load reviewer profile", error);
    return err({ reason: "Failed to load reviewer profile" });
  }
}

export async function saveReviewerProfile(
  userId: string,
  input: { slug: string; displayName: string; bio?: string; website?: string },
) {
  try {
    const taken = await db.query.reviewerProfiles.findFirst({
      where: eq(reviewerProfiles.slug, input.slug),
      columns: { userId: true },
    });
    if (taken && taken.userId !== userId) {
      return err({ reason: "That reviewer URL is already taken" });
    }
    const [row] = await db
      .insert(reviewerProfiles)
      .values({
        userId,
        slug: input.slug,
        displayName: input.displayName,
        bio: input.bio || null,
        website: input.website || null,
      })
      .onConflictDoUpdate({
        target: reviewerProfiles.userId,
        set: {
          slug: input.slug,
          displayName: input.displayName,
          bio: input.bio || null,
          website: input.website || null,
          updatedAt: new Date(),
        },
      })
      .returning();
    return ok(row);
  } catch (error) {
    console.error("Failed to save reviewer profile", error);
    return err({ reason: "Failed to save reviewer profile" });
  }
}

async function publishedBookBySlug(slug: string) {
  return db.query.books.findFirst({
    where: and(eq(books.slug, slug), publishedBook),
    columns: {
      id: true,
      slug: true,
      title: true,
      artistId: true,
      publisherId: true,
    },
    with: {
      artist: { columns: { ownerUserId: true } },
      publisher: { columns: { ownerUserId: true } },
    },
  });
}

export async function getMyReviewForBook(userId: string, bookId: string) {
  const review = await db.query.bookReviews.findFirst({
    where: and(eq(bookReviews.userId, userId), eq(bookReviews.bookId, bookId)),
  });
  return review ?? null;
}

export async function saveReview(
  userId: string,
  bookSlug: string,
  input: { title: string; body: string; externalUrl?: string },
) {
  try {
    const book = await publishedBookBySlug(bookSlug);
    if (!book) return err({ reason: "Book not found" });
    if (isBookCreator(userId, ownerIds(book))) {
      return err({ reason: "You can't review your own book" });
    }
    const existing = await getMyReviewForBook(userId, book.id);
    const review = existing
      ? (
          await db
            .update(bookReviews)
            .set({
              title: input.title,
              body: input.body,
              externalUrl: input.externalUrl || null,
              updatedAt: new Date(),
            })
            .where(eq(bookReviews.id, existing.id))
            .returning()
        )[0]
      : (
          await db
            .insert(bookReviews)
            .values({
              bookId: book.id,
              userId,
              title: input.title,
              body: input.body,
              externalUrl: input.externalUrl || null,
            })
            .returning()
        )[0];

    if (!review) return err({ reason: "Failed to save review" });

    const request = await db.query.reviewRequests.findFirst({
      where: and(
        eq(reviewRequests.bookId, book.id),
        eq(reviewRequests.userId, userId),
      ),
    });
    const next = requestStatusAfterReview(request?.status ?? null);
    if (request && next) {
      await db
        .update(reviewRequests)
        .set({ status: next, reviewId: review.id, updatedAt: new Date() })
        .where(eq(reviewRequests.id, request.id));
    }
    return ok(review);
  } catch (error) {
    console.error("Failed to save review", error);
    return err({ reason: "Failed to save review" });
  }
}

export async function deleteReview(userId: string, bookSlug: string) {
  try {
    const book = await publishedBookBySlug(bookSlug);
    if (!book) return err({ reason: "Book not found" });
    const existing = await getMyReviewForBook(userId, book.id);
    if (!existing) return err({ reason: "Review not found" });
    await db.delete(bookReviews).where(eq(bookReviews.id, existing.id));
    await db
      .update(reviewRequests)
      .set({ status: "sent", reviewId: null, updatedAt: new Date() })
      .where(
        and(
          eq(reviewRequests.bookId, book.id),
          eq(reviewRequests.userId, userId),
          eq(reviewRequests.status, "reviewed"),
        ),
      );
    return ok(true);
  } catch (error) {
    console.error("Failed to delete review", error);
    return err({ reason: "Failed to delete review" });
  }
}

export async function isAvailableForReview(bookId: string) {
  const row = await db.query.bookReviewAvailability.findFirst({
    where: eq(bookReviewAvailability.bookId, bookId),
    columns: { bookId: true },
  });
  return !!row;
}

export async function setAvailableForReview(bookId: string, available: boolean) {
  try {
    if (available) {
      await db
        .insert(bookReviewAvailability)
        .values({ bookId })
        .onConflictDoNothing();
    } else {
      await db
        .delete(bookReviewAvailability)
        .where(eq(bookReviewAvailability.bookId, bookId));
    }
    return ok(available);
  } catch (error) {
    console.error("Failed to update review availability", error);
    return err({ reason: "Failed to update review availability" });
  }
}

export async function listBooksAvailableForReview() {
  try {
    const rows = await db
      .select({
        id: books.id,
        slug: books.slug,
        title: books.title,
        coverUrl: books.coverUrl,
        artistName: creators.displayName,
      })
      .from(bookReviewAvailability)
      .innerJoin(books, eq(bookReviewAvailability.bookId, books.id))
      .leftJoin(creators, eq(books.artistId, creators.id))
      .where(publishedBook)
      .orderBy(desc(bookReviewAvailability.createdAt));
    return ok(rows);
  } catch (error) {
    console.error("Failed to list review copies", error);
    return err({ reason: "Failed to load books available for review" });
  }
}

export async function requestReviewCopy(
  userId: string,
  bookSlug: string,
  note?: string,
) {
  try {
    const profile = await db.query.reviewerProfiles.findFirst({
      where: eq(reviewerProfiles.userId, userId),
      columns: { userId: true },
    });
    if (!profile) {
      return err({ reason: "Set up a reviewer profile before requesting a copy" });
    }
    const book = await publishedBookBySlug(bookSlug);
    if (!book) return err({ reason: "Book not found" });
    if (isBookCreator(userId, ownerIds(book))) {
      return err({ reason: "You can't request a copy of your own book" });
    }
    const available = await isAvailableForReview(book.id);
    if (!available) return err({ reason: "This book isn't offering review copies" });
    const existing = await db.query.reviewRequests.findFirst({
      where: and(
        eq(reviewRequests.bookId, book.id),
        eq(reviewRequests.userId, userId),
      ),
      columns: { id: true },
    });
    if (existing) return err({ reason: "You already requested this book" });
    const [row] = await db
      .insert(reviewRequests)
      .values({ bookId: book.id, userId, note: note || null })
      .returning();
    return ok(row);
  } catch (error) {
    console.error("Failed to request review copy", error);
    return err({ reason: "Failed to request a review copy" });
  }
}

async function creatorIdsForUser(userId: string) {
  const rows = await db
    .select({ id: creators.id })
    .from(creators)
    .where(eq(creators.ownerUserId, userId));
  return rows.map((row) => row.id);
}

export async function listIncomingReviewRequests(userId: string, isAdmin: boolean) {
  try {
    const creatorIds = isAdmin ? [] : await creatorIdsForUser(userId);
    if (!isAdmin && creatorIds.length === 0) return ok([]);
    const ownedBooks = isAdmin
      ? []
      : await db
          .select({ id: books.id })
          .from(books)
          .where(
            or(
              inArray(books.artistId, creatorIds),
              inArray(books.publisherId, creatorIds),
            ),
          );
    if (!isAdmin && ownedBooks.length === 0) return ok([]);
    const rows = await db.query.reviewRequests.findMany({
      where: isAdmin
        ? undefined
        : inArray(
            reviewRequests.bookId,
            ownedBooks.map((row) => row.id),
          ),
      orderBy: [desc(reviewRequests.createdAt)],
      with: {
        book: { columns: { id: true, title: true, slug: true } },
        user: {
          columns: { id: true, firstName: true, lastName: true },
          with: {
            reviewerProfile: { columns: { slug: true, displayName: true } },
          },
        },
      },
    });
    return ok(rows);
  } catch (error) {
    console.error("Failed to list review requests", error);
    return err({ reason: "Failed to load review requests" });
  }
}

export async function listMyReviewRequests(userId: string) {
  try {
    const rows = await db.query.reviewRequests.findMany({
      where: eq(reviewRequests.userId, userId),
      orderBy: [desc(reviewRequests.createdAt)],
      with: { book: { columns: { title: true, slug: true } } },
    });
    return ok(rows);
  } catch (error) {
    console.error("Failed to list your review requests", error);
    return err({ reason: "Failed to load your requests" });
  }
}

export async function updateReviewRequestStatus(
  actorUserId: string,
  isAdmin: boolean,
  requestId: string,
  status: ReviewRequestStatus,
) {
  try {
    const request = await db.query.reviewRequests.findFirst({
      where: eq(reviewRequests.id, requestId),
      with: {
        book: {
          columns: { id: true, artistId: true, publisherId: true },
          with: {
            artist: { columns: { ownerUserId: true } },
            publisher: { columns: { ownerUserId: true } },
          },
        },
      },
    });
    if (!request) return err({ reason: "Request not found" });
    const allowed =
      isAdmin || isBookCreator(actorUserId, ownerIds(request.book));
    if (!allowed) return err({ reason: "You can't update this request" });
    if (!canTransitionReviewRequest(request.status, status)) {
      return err({ reason: "That status change isn't allowed" });
    }
    let next: ReviewRequestStatus = status;
    let reviewId = request.reviewId;
    if (status === "approved" || status === "sent") {
      const review = await getMyReviewForBook(request.userId, request.bookId);
      if (review) {
        next = "reviewed";
        reviewId = review.id;
      }
    }
    const [row] = await db
      .update(reviewRequests)
      .set({ status: next, reviewId, updatedAt: new Date() })
      .where(eq(reviewRequests.id, requestId))
      .returning();
    return ok(row);
  } catch (error) {
    console.error("Failed to update review request", error);
    return err({ reason: "Failed to update review request" });
  }
}

export function reviewerDisplayName(user: {
  firstName: string | null;
  lastName: string | null;
  reviewerProfile?: { displayName: string } | null;
}) {
  return user.reviewerProfile?.displayName ?? formatShelfOwnerName(user);
}

export async function getRequestForUserBook(userId: string, bookId: string) {
  return db.query.reviewRequests.findFirst({
    where: and(eq(reviewRequests.bookId, bookId), eq(reviewRequests.userId, userId)),
  });
}

export { formatShelfOwnerName };
