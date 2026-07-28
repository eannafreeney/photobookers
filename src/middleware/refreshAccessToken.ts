import { Context, Next } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { supabaseAdmin } from "../lib/supabase";
import { getCookieClearOptions } from "../lib/authCookies";
import { getAuthCookieOptions } from "../features/auth/services";

export async function refreshAccessToken(refreshToken: string, c?: Context) {
  try {
    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      // Clear invalid refresh token cookie if context is provided
      if (c) {
        const clearOpts = getCookieClearOptions(c);
        deleteCookie(c, "refresh_token", clearOpts);
        deleteCookie(c, "token", clearOpts);
      }
      return null;
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
    };
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
}

/**
 * Refreshes the session and, on success, writes the new `token` /
 * `refresh_token` cookies. Returns the refreshed tokens, or null if the refresh
 * token is invalid/expired (in which case the cookies are cleared).
 *
 * Shared by {@link requireAuth} and {@link optionalAuthMiddleware} so the
 * refresh-and-set-cookies logic can't drift between them.
 */
export async function refreshSessionAndSetCookies(
  c: Context,
  refreshToken: string,
) {
  const refreshed = await refreshAccessToken(refreshToken, c);
  if (!refreshed) return null;

  setCookie(c, "token", refreshed.access_token, {
    ...getAuthCookieOptions(c),
    maxAge: refreshed.expires_in,
  });
  setCookie(c, "refresh_token", refreshed.refresh_token, {
    ...getAuthCookieOptions(c),
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return refreshed;
}
