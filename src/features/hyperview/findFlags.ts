import type { AuthUser } from "../../../types";
import { findWishlist } from "../api/services";
import { isOk } from "../../lib/result";

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
