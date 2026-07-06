import { deleteCookie } from "hono/cookie";
import { supabaseAdmin } from "../lib/supabase.js";
import { getCookieClearOptions } from "../lib/authCookies.js";
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
export {
  refreshAccessToken
};
