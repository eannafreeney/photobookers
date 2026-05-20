import type { AuthUser } from "../../../types";
import { findLike, findWishlist } from "../api/services";
import { isOk } from "../../lib/result";
import { findCollectionItem } from "../../db/queries";

/** Parallel like lookups for Hyperview book lists (matches web LikeButton state). */
export async function likeFlagsForBooks(
  user: AuthUser | null,
  books: readonly { id: string }[],
): Promise<Record<string, boolean>> {
  if (!user?.id || books.length === 0) return {};
  const entries = await Promise.all(
    books.map(
      async (b) =>
        [b.id, isOk(await findLike(user.id, b.id))] as [string, boolean],
    ),
  );
  return Object.fromEntries(entries);
}

export async function wishlistFlagsForBooks(
  user: AuthUser | null,
  books: readonly { id: string }[],
): Promise<Record<string, boolean>> {
  if (!user?.id || books.length === 0) return {};
  const entries = await Promise.all(
    books.map(
      async (b) =>
        [b.id, isOk(await findWishlist(user.id, b.id))] as [string, boolean],
    ),
  );
  return Object.fromEntries(entries);
}

export async function collectionFlagsForBooks(
  user: AuthUser | null,
  books: readonly { id: string }[],
): Promise<Record<string, boolean>> {
  if (!user?.id || books.length === 0) return {};
  const entries = await Promise.all(
    books.map(
      async (b) =>
        [b.id, isOk(await findCollectionItem(user.id, b.id))] as [
          string,
          boolean,
        ],
    ),
  );
  return Object.fromEntries(entries);
}
