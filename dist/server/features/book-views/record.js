import { getCookie, setCookie } from "hono/cookie";
import { getSharedCookieOptions } from "../../lib/authCookies.js";
import { getUser } from "../../utils.js";
import { recordBookView } from "./services.js";
function bookViewCookieName(bookSlug) {
  return `pb_bv_${bookSlug}`;
}
async function maybeRecordBookView(c, book, source) {
  const cookieName = bookViewCookieName(book.slug);
  if (getCookie(c, cookieName)) return;
  const user = await getUser(c);
  const referer = c.req.header("referer");
  void recordBookView({
    bookId: book.id,
    userId: user?.id ?? null,
    source,
    referer
  }).catch((error) => {
    console.error("Failed to record book view", error);
  });
  setCookie(c, cookieName, "1", {
    ...getSharedCookieOptions(c),
    httpOnly: true,
    sameSite: "Lax"
  });
}
export {
  bookViewCookieName,
  maybeRecordBookView
};
