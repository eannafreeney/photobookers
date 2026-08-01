import { deleteCookie, setCookie } from "hono/cookie";
import { supabaseAdmin } from "../lib/supabase.js";
import { getCookieClearOptions } from "../lib/authCookies.js";
import { getAuthCookieOptions } from "../features/auth/services.js";
async function refreshAccessToken(refreshToken, c) {
  try {
    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token: refreshToken
    });
    if (error || !data.session) {
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
      expires_in: data.session.expires_in
    };
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
}
async function refreshSessionAndSetCookies(c, refreshToken) {
  const refreshed = await refreshAccessToken(refreshToken, c);
  if (!refreshed) return null;
  setCookie(c, "token", refreshed.access_token, {
    ...getAuthCookieOptions(c),
    maxAge: refreshed.expires_in
  });
  setCookie(c, "refresh_token", refreshed.refresh_token, {
    ...getAuthCookieOptions(c),
    maxAge: 60 * 60 * 24 * 7
    // 7 days
  });
  return refreshed;
}
export {
  refreshAccessToken,
  refreshSessionAndSetCookies
};
