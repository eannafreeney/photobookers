import { AuthUser } from "../../types";
import { Creator } from "../db/schema";

export function isAdmin(user: AuthUser) {
  return user?.role === "admin";
}

export function isCreatorOwner(user: AuthUser, creator: Creator) {
  return creator.ownerUserId === user.id;
}

export function canUploadBook(
  user: AuthUser,
  artist: Creator,
  publisher: Creator
) {
  if (!user) return false;
  if (isAdmin(user)) return true;

  // User owns artist → can upload
  if (artist && isCreatorOwner(user, artist)) return true;

  // User owns publisher → can upload
  if (publisher && isCreatorOwner(user, publisher)) return true;

  return false;
}
