import type { AuthUser } from "../../../types";
import { findFollow, findWishlist } from "../api/services";
import { isOk } from "../../lib/result";

export async function favoriteFlagsForBooks(
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


export async function followFlagsForCreators(
  user: AuthUser | null,
  creators: readonly { id: string }[],
): Promise<Record<string, boolean>> {
  if (!user?.id || creators.length === 0) return {};
  const entries = await Promise.all(
    creators.map(
      async (c) =>
        [c.id, !!(await findFollow(c.id, user.id))] as [string, boolean],
    ),
  );
  return Object.fromEntries(entries);
}
