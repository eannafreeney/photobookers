import { Context, Next } from "hono";
import { setCookie } from "hono/cookie";
import { supabaseAdmin } from "../lib/supabase";
import { AuthUser } from "../../types";
import { getAuthCookieOptions } from "../features/auth/services";

export async function checkIncompleteCreatorSignup(c: Context, user: AuthUser) {
  // Check if user has an intended creator type but no creator profile
  if (!user) return null;

  // First check the database field (primary source)
  let intendedType = user.intendedCreatorType;

  // If user has an intended creator type but no creator profile, redirect them
  if (
    intendedType &&
    (intendedType === "artist" || intendedType === "publisher") &&
    !user.creator
  ) {
    return c.redirect(`/dashboard/creators/new?type=${intendedType}`);
  }

  return null;
}

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

  // Store access token (short-lived)
  setCookie(c, "token", data.session.access_token, {
    ...getAuthCookieOptions(),
    maxAge: data.session.expires_in,
  });

  // Store refresh token (long-lived, e.g., 7 days)
  setCookie(c, "refresh_token", data.session.refresh_token, {
    ...getAuthCookieOptions(),
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}
