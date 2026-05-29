import { Context } from "hono";
import { getSharedCookieOptions } from "../../lib/authCookies";
import { supabaseAdmin, supabaseAnon } from "../../lib/supabase";
import { setCookie } from "hono/cookie";
import { db } from "../../db/client";
import { creators, User, users } from "../../db/schema";
import { and, eq, ne, sql } from "drizzle-orm";
import { normalizeUrl } from "../../services/verification";
import { err, ok } from "../../lib/result";
import { registerCreatorFormSchema, registerFanFormSchema } from "./schema";
import z from "zod";
import { AuthSession } from "@supabase/supabase-js";
import { registerAndClaimFormSchema } from "../claims/schema";
import { randomBytes } from "node:crypto";

export const getMustResetPasswordState = async (userId: string) => {
  try {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { mustResetPassword: true },
    });
    if (!dbUser) return err({ reason: "User not found", cause: undefined });
    return ok(dbUser?.mustResetPassword === true);
  } catch (error) {
    return err({
      reason: "Failed to check if user was forced to reset password",
      cause: error,
    });
  }
};

export const setCookiesAndVerifyUser = async (
  c: Context,
  session: AuthSession,
) => {
  const { access_token, refresh_token, expires_in, user } = session;

  setAccessToken(c, access_token, expires_in);
  setRefreshToken(c, refresh_token);

  await markCreatorsOwnedByUserAsVerified(user.id);
};

const markCreatorsOwnedByUserAsVerified = async (userId: string) => {
  try {
    await db
      .update(creators)
      .set({
        status: "verified",
        verifiedAt: sql`COALESCE(${creators.verifiedAt}, NOW())`,
      })
      .where(
        and(eq(creators.ownerUserId, userId), ne(creators.status, "verified")),
      );
    return ok(undefined);
  } catch (e) {
    return err({ reason: "Failed to mark creators as verified", cause: e });
  }
};

export function getAuthCookieOptions(c?: Context): {
  httpOnly: true;
  path: "/";
  maxAge: number;
  domain?: string;
  secure?: boolean;
  sameSite: "lax";
} {
  return {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
    ...getSharedCookieOptions(c),
  };
}

export async function loginAndSetCookies(
  c: Context,
  email: string,
  password: string,
) {
  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return err({ reason: error.message, cause: error });
    if (!data.session) return err({ reason: "No session", cause: undefined });

    await setCookiesAndVerifyUser(c, data.session);

    return ok({
      userId: data.user.id,
      session: data.session,
    });
  } catch (error) {
    return err({ reason: "Failed to login", cause: error });
  }
}

export const setAccessToken = (
  c: Context,
  accessToken: string,
  maxAge: number,
) =>
  setCookie(c, "token", accessToken, {
    ...getAuthCookieOptions(c),
    maxAge,
  });

export const setRefreshToken = (c: Context, refreshToken: string) =>
  setCookie(c, "refresh_token", refreshToken, {
    ...getAuthCookieOptions(c),
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

export const getCreatorBySlug = (slug: string) =>
  db.query.creators.findFirst({
    where: eq(creators.slug, slug),
  });

export const getCreatorByWebsite = (website: string) =>
  db.query.creators.findFirst({
    where: eq(creators.website, normalizeUrl(website)),
  });

export const createUserInDatabase = async (
  session: AuthSession,
  options?: { mustResetPassword?: boolean },
) => {
  const { user } = session;
  const { id, email, user_metadata } = user;
  if (!email) {
    return err({ reason: "User has no email", cause: undefined });
  }
  const { firstName, lastName } = user_metadata ?? {};
  try {
    const [newUser] = await db
      .insert(users)
      .values({
        id,
        email,
        firstName,
        lastName,
        acceptsTerms: new Date(),
        createdAt: new Date(),
        mustResetPassword: options?.mustResetPassword ?? false,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...(firstName != null && { firstName }),
          ...(lastName != null && { lastName }),
          createdAt: sql`COALESCE(${users.createdAt}, now())`,
          updatedAt: new Date(),
          ...(options?.mustResetPassword && { mustResetPassword: true }),
        },
      })
      .returning();
    return ok(newUser);
  } catch (e) {
    return err({ reason: "Failed to create account", cause: e });
  }
};

function generateOtpSignupPassword() {
  // 32+ bytes, URL-safe, satisfies typical min-length policies
  return randomBytes(32).toString("base64url");
}

export const verifyOtpForClaimSignup = async (
  c: Context,
  formData: z.infer<typeof registerAndClaimFormSchema>,
  creatorId: string,
  verificationUrl: string | null,
) => {
  try {
    const baseUrl = process.env.SITE_URL ?? "http://localhost:5173";
    const emailRedirectTo = `${baseUrl.replace(/\/$/, "")}/auth/callback`;

    const { error } = await supabaseAnon.auth.signUp({
      email: formData.email,
      password: generateOtpSignupPassword(),
      options: {
        emailRedirectTo,
        captchaToken: formData.captchaToken,
        data: {
          firstName: formData?.firstName ?? null,
          lastName: formData?.lastName ?? null,
          verificationUrl: verificationUrl ?? null,
          creatorId,
          claimIntent: true,
        },
      },
    });
    if (error) return err({ reason: error.message, cause: error });
    return ok(undefined);
  } catch (error) {
    return err({ reason: "Failed to verify OTP", cause: error });
  }
};

export const verifyOtpForFanSignup = async (
  c: Context,
  formData: z.infer<typeof registerFanFormSchema>,
) => {
  try {
    const baseUrl = process.env.SITE_URL ?? "http://localhost:5173";
    const emailRedirectTo = `${baseUrl.replace(/\/$/, "")}/auth/callback`;

    const { error } = await supabaseAnon.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo,
        captchaToken: formData.captchaToken,
        data: {
          firstName: formData?.firstName ?? null,
          lastName: formData?.lastName ?? null,
        },
      },
    });
    if (error) return err({ reason: error.message, cause: error });
    return ok(undefined);
  } catch (error) {
    return err({ reason: "Failed to verify OTP", cause: error });
  }
};

export const verifyOtpForCreatorSignup = async (
  c: Context,
  formData: z.infer<typeof registerCreatorFormSchema>,
) => {
  try {
    const baseUrl = process.env.SITE_URL ?? "http://localhost:5173";
    const emailRedirectTo = `${baseUrl.replace(/\/$/, "")}/auth/callback`;

    const { error } = await supabaseAnon.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo,
        captchaToken: formData.captchaToken,
        data: {
          type: formData?.type ?? "artist",
          website: normalizeUrl(formData?.website ?? ""),
          displayName: formData?.displayName ?? null,
        },
      },
    });
    if (error) return err({ reason: error.message, cause: error });
    return ok(undefined);
  } catch (error) {
    return err({ reason: "Failed to verify OTP", cause: error });
  }
};

export const clearMustResetPassword = async (userId: string) => {
  try {
    await db
      .update(users)
      .set({ mustResetPassword: false })
      .where(eq(users.id, userId));
    return ok(undefined);
  } catch (error) {
    return err({ reason: "Failed to set reset password flag", cause: error });
  }
};
