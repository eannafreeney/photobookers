import { findFollow, findWishlist } from "../api/services.js";
import { isOk } from "../../lib/result.js";
async function favoriteFlagsForBooks(user, books) {
  if (!user?.id || books.length === 0) return {};
  const entries = await Promise.all(
    books.map(
      async (b) => [b.id, isOk(await findWishlist(user.id, b.id))]
    )
  );
  return Object.fromEntries(entries);
}
async function followFlagsForCreators(user, creators) {
  if (!user?.id || creators.length === 0) return {};
  const entries = await Promise.all(
    creators.map(
      async (c) => [c.id, !!await findFollow(c.id, user.id)]
    )
  );
  return Object.fromEntries(entries);
}
export {
  favoriteFlagsForBooks,
  followFlagsForCreators
};
