import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { getSharedCookieOptions } from "../../lib/authCookies";
import { getUser } from "../../utils";
import type { CreatorViewSource } from "../../db/schema";
import { recordCreatorView } from "./services";

export function creatorViewCookieName(creatorSlug: string) {
  return `pb_cv_${creatorSlug}`;
}

export async function maybeRecordCreatorView(
  c: Context,
  creator: { id: string; slug: string },
  source: CreatorViewSource,
) {
  const cookieName = creatorViewCookieName(creator.slug);
  if (getCookie(c, cookieName)) return;

  const user = await getUser(c);
  const referer = c.req.header("referer");

  void recordCreatorView({
    creatorId: creator.id,
    userId: user?.id ?? null,
    source,
    referer,
  }).catch((error) => {
    console.error("Failed to record creator view", error);
  });

  setCookie(c, cookieName, "1", {
    ...getSharedCookieOptions(c),
    httpOnly: true,
    sameSite: "Lax",
  });
}
