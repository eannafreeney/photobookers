import { Context } from "hono";
import { supabaseAdmin } from "../lib/supabase";
import { setAccessToken, setRefreshToken } from "../features/auth/services";

// REQUIRED auth - redirects to login if not authenticated

// OPTIONAL auth - loads user if logged in, continues either way

export async function login(c: Context, email: string, password: string) {
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return error.message;
  }

  const { access_token, refresh_token, expires_in } = data.session;

  setAccessToken(c, access_token, expires_in);
  setRefreshToken(c, refresh_token);

  // Store access token (short-lived)
  // setCookie(c, "token", data.session.access_token, {
  //   ...getAuthCookieOptions(),
  //   maxAge: data.session.expires_in,
  // });

  // // Store refresh token (long-lived, e.g., 7 days)
  // setCookie(c, "refresh_token", data.session.refresh_token, {
  //   ...getAuthCookieOptions(),
  //   maxAge: 60 * 60 * 24 * 7, // 7 days
  // });
}
