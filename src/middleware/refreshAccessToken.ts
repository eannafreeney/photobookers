import { Context, Next } from "hono";
import { deleteCookie } from "hono/cookie";
import { supabaseAdmin } from "../lib/supabase";
import { getCookieClearOptions } from "../lib/authCookies";

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
