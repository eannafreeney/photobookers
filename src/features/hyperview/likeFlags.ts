import type { AuthUser } from "../../../types";
import { findLike } from "../api/services";
import { isOk } from "../../lib/result";

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
