import { Context } from "hono";
import { supabaseAdmin } from "../../lib/supabase";
import { setCookie } from "hono/cookie";
import { db } from "../../db/client";
import { creators, users } from "../../db/schema";
import { and, eq, ne } from "drizzle-orm";
import { normalizeUrl } from "../../services/verification";

export const setCookiesAndVerifyUser = async (
  c: Context,
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
  userId: string,
) => {
  setAccessToken(c, accessToken, expiresIn);
  setRefreshToken(c, refreshToken);

  await markCreatorsOwnedByUserAsVerified(userId);
};

const markCreatorsOwnedByUserAsVerified = async (userId: string) => {
  await db
    .update(creators)
    .set({
      status: "verified",
    })
    .where(
      and(eq(creators.ownerUserId, userId), ne(creators.status, "verified")),
    );
};

export function getAuthCookieOptions(): {
  httpOnly: true;
  path: "/";
  maxAge: number;
  domain?: string;
  secure?: boolean;
  sameSite: "lax";
} {
  const baseUrl = process.env.SITE_URL ?? "http://localhost:5173";
  let hostname: string;
  try {
    hostname = new URL(baseUrl).hostname;
  } catch {
    hostname = "";
  }
  const isLocal =
    !hostname || hostname === "localhost" || hostname === "127.0.0.1";
  const cookieOptions: {
    httpOnly: true;
    path: "/";
    maxAge: number;
    domain?: string;
    secure?: boolean;
    sameSite: "lax";
  } = {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  };
  if (!isLocal) {
    const rootDomain = hostname.replace(/^www\./i, "");
    cookieOptions.domain = `.${rootDomain}`;
    cookieOptions.secure = true;
  }
  return cookieOptions;
}

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

  await setCookiesAndVerifyUser(
    c,
    access_token,
    refresh_token,
    expires_in,
    data.user.id,
  );
}

export const setAccessToken = (
  c: Context,
  accessToken: string,
  maxAge: number,
) =>
  setCookie(c, "token", accessToken, {
    ...getAuthCookieOptions(),
    maxAge,
  });

export const setRefreshToken = (c: Context, refreshToken: string) =>
  setCookie(c, "refresh_token", refreshToken, {
    ...getAuthCookieOptions(),
    maxAge: 60 * 60 * 24 * 7, // 7 days
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

export const getCreatorByDisplayName = (displayName: string) =>
  db.query.creators.findFirst({
    where: eq(creators.displayName, displayName),
  });

export const getCreatorByWebsite = (website: string) =>
  db.query.creators.findFirst({
    where: eq(creators.website, normalizeUrl(website)),
  });
