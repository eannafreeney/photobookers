import { Context } from "hono";
import { createSupabaseClient, supabaseAdmin } from "../../lib/supabase";
import { setCookie } from "hono/cookie";
import { db } from "../../db/client";
import { creators, User, users } from "../../db/schema";
import { and, eq, ne } from "drizzle-orm";
import { normalizeUrl } from "../../services/verification";
import { err, ok } from "../../lib/result";
import { registerCreatorFormSchema, registerFanFormSchema } from "./schema";
import z from "zod";
import { AuthSession } from "@supabase/supabase-js";
import { registerAndClaimFormSchema } from "../claims/schema";

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
      })
      .where(
        and(eq(creators.ownerUserId, userId), ne(creators.status, "verified")),
      );
    return ok(undefined);
  } catch (e) {
    return err({ reason: "Failed to mark creators as verified", cause: e });
  }
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
): Promise<{ userId: string } | { error: string }> {
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };

  await setCookiesAndVerifyUser(c, data.session);

  return { userId: data.user.id };
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

export const getCreatorBySlug = (slug: string) =>
  db.query.creators.findFirst({
    where: eq(creators.slug, slug),
  });

export const getCreatorByWebsite = (website: string) =>
  db.query.creators.findFirst({
    where: eq(creators.website, normalizeUrl(website)),
  });

export const createUserInDatabase = async (session: AuthSession) => {
  const { user } = session;
  const { id, email, user_metadata } = user;
  if (!email) {
    return err({ reason: "User has no email", cause: undefined });
  }
  const { firstName, lastName } = user_metadata ?? {};
  try {
    const newUser = await db
      .insert(users)
      .values({
        id,
        email,
        firstName,
        lastName,
        acceptsTerms: new Date(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...(firstName != null && { firstName }),
          ...(lastName != null && { lastName }),
          updatedAt: new Date(),
        },
      })
      .returning();
    return ok(newUser);
  } catch (e) {
    return err({ reason: "Failed to create account", cause: e });
  }
};

export const verifyOtpForClaimSignup = async (
  c: Context,
  formData: z.infer<typeof registerAndClaimFormSchema>,
  creatorId: string,
  verificationUrl: string,
) => {
  try {
    const supabase = createSupabaseClient(c);
    const baseUrl = process.env.SITE_URL ?? "http://localhost:5173";
    const emailRedirectTo = `${baseUrl.replace(/\/$/, "")}/auth/callback`;

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo,
        data: {
          firstName: formData?.firstName ?? null,
          lastName: formData?.lastName ?? null,
          verificationUrl: verificationUrl,
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
    const supabase = createSupabaseClient(c);
    const baseUrl = process.env.SITE_URL ?? "http://localhost:5173";
    const emailRedirectTo = `${baseUrl.replace(/\/$/, "")}/auth/callback`;

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo,
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
    const supabase = createSupabaseClient(c);
    const baseUrl = process.env.SITE_URL ?? "http://localhost:5173";
    const emailRedirectTo = `${baseUrl.replace(/\/$/, "")}/auth/callback`;

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo,
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

export const checkWasForcedResetPassword = async (userId: string) => {
  try {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { mustResetPassword: true },
    });
    return ok(dbUser?.mustResetPassword === true);
  } catch (error) {
    return err({
      reason: "Failed to check if user was forced to reset password",
      cause: error,
    });
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
