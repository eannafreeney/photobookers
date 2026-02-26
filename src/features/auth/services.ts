import { Context } from "hono";
import { supabaseAdmin } from "../../lib/supabase";
import { setCookie } from "hono/cookie";
import { db } from "../../db/client";
import { users } from "../../db/schema";

export async function loginAndSetCookies(
  c: Context,
  email: string,
  password: string,
) {
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
}

export const setAccessToken = (
  c: Context,
  accessToken: string,
  maxAge: number,
) =>
  setCookie(c, "token", accessToken, {
    httpOnly: true,
    maxAge,
    path: "/",
  });

export const setRefreshToken = (c: Context, refreshToken: string) =>
  setCookie(c, "refresh_token", refreshToken, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

export const createUser = async (userId: string, email: string) => {
  return await db
    .insert(users)
    .values({
      id: userId,
      email,
      firstName: null,
      lastName: null,
    })
    .onConflictDoNothing({ target: users.id });
};
