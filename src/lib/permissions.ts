// src/lib/permissions.ts

import { AuthUser } from "../../types";
import { Book, Creator } from "../db/schema";

export function canEditBook(user: AuthUser | null, book: Book): boolean {
  if (!user) return false;
  if (user.isAdmin) return true;
  if (!user.creator) return false;

  const isCreatorProfileCreatedByUser =
    user.creator.createdByUserId === user.id;
  const isBookOwnedByCreator =
    user.creator.id === book.artistId || user.creator.id === book.publisherId;

  // User claimed this profile (did not create it) → must be verified to edit any book
  if (!isCreatorProfileCreatedByUser && user.creator.status !== "verified") {
    return false;
  }

  // User created the book for a stub publisher not yet approved
  if (user.id === book.createdByUserId && book.approvalStatus !== "approved")
    return true;

  // Creator owns the book (artist or publisher) – allowed if they created the profile, or if verified
  if (isBookOwnedByCreator) return true;

  return false;
}

export function canDeleteBook(user: AuthUser | null, book: Book): boolean {
  if (!user) return false;
  if (user.isAdmin) return true;
  if (!user.creator) return false;

  const isCreatorProfileCreatedByUser =
    user.creator.createdByUserId === user.id;
  const isBookOwnedByCreator =
    user.creator.id === book.artistId || user.creator.id === book.publisherId;

  // User claimed this profile (did not create it) → must be verified to edit any book
  if (!isCreatorProfileCreatedByUser && user.creator.status !== "verified") {
    return false;
  }

  // User created the book for a stub publisher not yet approved
  if (user.id === book.createdByUserId && book.approvalStatus !== "approved")
    return true;

  // Creator owns the book (artist or publisher) – allowed if they created the profile, or if verified
  if (isBookOwnedByCreator) return true;

  return false;
}

export function canPreviewBook(
  user: AuthUser | null,
  book: Pick<
    Book,
    "coverUrl" | "publicationStatus" | "artistId" | "publisherId"
  >,
): boolean {
  if (!user) return false;
  if (!book.coverUrl) return false;

  const isDraftMode = book.publicationStatus === "draft";

  // Creator owns the book (artist or publisher)
  if (user.creator?.id === book.artistId && isDraftMode) return true;
  if (user.creator?.id === book.publisherId && isDraftMode) return true;

  return false;
}

export function canEditCreator(
  user: AuthUser | null,
  creator: Creator,
): boolean {
  if (!user) return false;
  if (user.isAdmin) return true;
  // Owner of the creator profile
  return user.id === creator.ownerUserId;
}

export function canClaimCreator(
  user: AuthUser | null,
  creator: Creator,
): boolean {
  // user already has a creator profile
  if (user?.creator?.id) return false;
  // user is the owner of the creator profile
  if (user?.id === creator.ownerUserId) return false;

  return true;
}

export function canPublishBook(user: AuthUser | null, book: Book): boolean {
  if (!user) return false;
  if (user.isAdmin) return true;

  if (user.creator?.status !== "verified") return false;

  const coverUrlIsSet = book.coverUrl !== null;

  if (coverUrlIsSet) {
    return true;
  }

  return false;
}

export function canUnpublishBook(user: AuthUser | null, book: Book): boolean {
  if (!user) return false;
  if (user.isAdmin) return true;

  if (user.creator?.status !== "verified") return false;

  return book.publicationStatus === "published";
}

export function canFollowCreator(
  user: AuthUser | null,
  creator: Pick<Creator, "id" | "displayName">,
): boolean {
  // User is not creator
  return user?.creator?.id !== creator.id && user?.creator?.id !== null;
}

export function canWishlistBook(
  user: AuthUser | null,
  book: Pick<Book, "artistId" | "publisherId">,
): boolean {
  return (
    user?.creator?.id !== book.artistId &&
    user?.creator?.id !== book.publisherId
  );
}

export function canAddToCollection(
  user: AuthUser | null,
  book: Pick<Book, "artistId" | "publisherId">,
): boolean {
  return (
    user?.creator?.id !== book.artistId &&
    user?.creator?.id !== book.publisherId
  );
}
