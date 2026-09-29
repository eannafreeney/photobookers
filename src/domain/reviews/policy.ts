import type { ReviewRequestStatus } from "../../db/schema";

const TRANSITIONS: Record<ReviewRequestStatus, ReviewRequestStatus[]> = {
  requested: ["approved", "declined"],
  approved: ["sent", "declined"],
  sent: ["reviewed"],
  declined: [],
  reviewed: [],
};

export function canTransitionReviewRequest(
  from: ReviewRequestStatus,
  to: ReviewRequestStatus,
): boolean {
  return TRANSITIONS[from].includes(to);
}

/** Artist or publisher owner of the book cannot review it or request a copy. */
export function isBookCreator(
  userId: string,
  owners: { artistOwnerUserId?: string | null; publisherOwnerUserId?: string | null },
): boolean {
  return (
    userId === owners.artistOwnerUserId || userId === owners.publisherOwnerUserId
  );
}

export function reviewBylineHref(author: {
  reviewerSlug?: string | null;
  shelfSlug?: string | null;
  shelfPublic?: boolean;
}): string | null {
  if (author.reviewerSlug) return `/reviewers/${author.reviewerSlug}`;
  if (author.shelfPublic && author.shelfSlug) return `/shelf/${author.shelfSlug}`;
  return null;
}

/** A linked review that came through an approved copy. */
export function showsReviewCopyLabel(status: ReviewRequestStatus | null): boolean {
  return status === "reviewed";
}

/** Publishing a review closes an approved or sent request. */
export function requestStatusAfterReview(
  status: ReviewRequestStatus | null,
): ReviewRequestStatus | null {
  if (status === "approved" || status === "sent") return "reviewed";
  return null;
}
