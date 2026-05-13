import type { Context } from "hono";
import { getCookie } from "hono/cookie";

/** Cookie (web) or `Authorization: Bearer` (Expo / Hyperview). */
export function getAccessTokenFromRequest(c: Context): string | undefined {
  const accessToken = getCookie(c, "token");
  if (accessToken) return accessToken;

  const auth = c.req.header("Authorization");
  if (!auth) return undefined;
  const match = /^Bearer\s+(\S+)$/i.exec(auth.trim());
  return match?.[1];
}
