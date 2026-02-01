// src/lib/permissions.ts

import { AuthUser } from "../../types";
import { Book, Creator } from "../db/schema";

export function canEditBook(user: AuthUser | null, book: Book): boolean {
  if (!user) return false;

  // User created the book for a stub publisher not yet approved
  if (user.id === book.createdByUserId && book.approvalStatus !== "approved")
    return true;

  // Creator owns the book (artist or publisher)
  if (user.creator?.id === book.artistId) return true;
  if (user.creator?.id === book.publisherId) return true;

  return false;
}

export function canDeleteBook(user: AuthUser | null, book: Book): boolean {
  if (!user) return false;

  // User created the book for a stub publisher not yet approved
  if (user.id === book.createdByUserId && book.approvalStatus !== "approved")
    return true;

  // Creator owns the book (artist or publisher)
  if (user.creator?.id === book.artistId) return true;
  if (user.creator?.id === book.publisherId) return true;

  return false;
}

export function canEditCreator(
  user: AuthUser | null,
  creator: Creator
): boolean {
  if (!user) return false;

  // Owner of the creator profile
  return user.id === creator.ownerUserId;
}

export function canClaimCreator(
  user: AuthUser | null,
  creator: Creator
): boolean {
  if (!user) return false;
  // user already has a creator profile
  if (user.creator?.id) return false;
  // user is the owner of the creator profile
  return user.id === creator.ownerUserId;
}

export function canPublishBook(user: AuthUser | null, book: Book): boolean {
  if (!user) return false;

  // const creatorIsOwner =
  //   user.creator?.id === book.artistId || user.creator?.id === book.publisherId;
  const coverUrlIsSet = book.coverUrl !== null;

  if (coverUrlIsSet) {
    return true;
  }

  return false;
}

export function canFollowCreator(
  user: AuthUser | null,
  creatorToFollowId: string
): boolean {
  // User is not creator
  return user?.creator?.id !== creatorToFollowId && user?.creator?.id !== null;
}

export function canWishlistBook(user: AuthUser | null, book: Book): boolean {
  return (
    user?.creator?.id !== book.artistId &&
    user?.creator?.id !== book.publisherId
  );
}

export function canAddToCollection(user: AuthUser | null, book: Book): boolean {
  return (
    user?.creator?.id !== book.artistId &&
    user?.creator?.id !== book.publisherId
  );
}
