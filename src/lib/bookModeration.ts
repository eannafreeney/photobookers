import type { Creator } from "../db/schema";

export const TRUST_VERIFIED_AGE_DAYS = 30;
export const TRUST_MIN_BOOKS_SINCE_VERIFY = 2;

function daysSince(date: Date, now = new Date()): number {
  return (now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000);
}

/** `true` => new book should start as pending (needs admin review). */
export function shouldModerateNewBook(args: {
  creatorVerifiedAt: Date | null;
  creatorStatus: Creator["status"];
  booksUploadedSinceVerificationBeforeInsert: number;
  approvedBooksSinceVerificationBeforeInsert: number;
  now?: Date;
}): boolean {
  if (args.creatorStatus !== "verified" || !args.creatorVerifiedAt) return true;
  if (
    args.approvedBooksSinceVerificationBeforeInsert >=
    TRUST_MIN_BOOKS_SINCE_VERIFY
  )
    return false;
  if (daysSince(args.creatorVerifiedAt, args.now) < TRUST_VERIFIED_AGE_DAYS)
    return true;
  if (
    args.booksUploadedSinceVerificationBeforeInsert <
    TRUST_MIN_BOOKS_SINCE_VERIFY
  )
    return true;
  return false;
}
