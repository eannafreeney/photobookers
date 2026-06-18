import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { getSharedCookieOptions } from "../../lib/authCookies";
import { getUser } from "../../utils";
import type { BookViewSource } from "../../db/schema";
import { recordBookView } from "./services";

export function bookViewCookieName(bookSlug: string) {
  return `pb_bv_${bookSlug}`;
}

export async function maybeRecordBookView(
  c: Context,
  book: { id: string; slug: string },
  source: BookViewSource,
) {
  const cookieName = bookViewCookieName(book.slug);
  if (getCookie(c, cookieName)) return;

  const user = await getUser(c);
  const referer = c.req.header("referer");

  void recordBookView({
    bookId: book.id,
    userId: user?.id ?? null,
    source,
    referer,
  }).catch((error) => {
    console.error("Failed to record book view", error);
  });

  setCookie(c, cookieName, "1", {
    ...getSharedCookieOptions(c),
    httpOnly: true,
    sameSite: "Lax",
  });
}
