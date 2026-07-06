import { getSharedCookieOptions } from "../../lib/authCookies.js";
import { supabaseAdmin, supabaseAnon } from "../../lib/supabase.js";
import { setCookie } from "hono/cookie";
import { db } from "../../db/client.js";
import { creators, users } from "../../db/schema.js";
import { and, eq, ne, sql } from "drizzle-orm";
import { normalizeUrl } from "../../services/verification.js";
import { err, ok } from "../../lib/result.js";
import { randomBytes } from "node:crypto";
const getMustResetPasswordState = async (userId) => {
  try {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { mustResetPassword: true }
    });
    if (!dbUser) return err({ reason: "User not found", cause: void 0 });
    return ok(dbUser?.mustResetPassword === true);
  } catch (error) {
    return err({
      reason: "Failed to check if user was forced to reset password",
      cause: error
    });
  }
};
const setCookiesAndVerifyUser = async (c, session) => {
  const { access_token, refresh_token, expires_in, user } = session;
  setAccessToken(c, access_token, expires_in);
  setRefreshToken(c, refresh_token);
  await markCreatorsOwnedByUserAsVerified(user.id);
};
const markCreatorsOwnedByUserAsVerified = async (userId) => {
  try {
    await db.update(creators).set({
      status: "verified",
      verifiedAt: sql`COALESCE(${creators.verifiedAt}, NOW())`
    }).where(
      and(eq(creators.ownerUserId, userId), ne(creators.status, "verified"))
    );
    return ok(void 0);
  } catch (e) {
    return err({ reason: "Failed to mark creators as verified", cause: e });
  }
};
function getAuthCookieOptions(c) {
  return {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
    ...getSharedCookieOptions(c)
  };
}
async function loginAndSetCookies(c, email, password) {
  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });
    if (error) return err({ reason: error.message, cause: error });
    if (!data.session) return err({ reason: "No session", cause: void 0 });
    await setCookiesAndVerifyUser(c, data.session);
    return ok({
      userId: data.user.id,
      session: data.session
    });
  } catch (error) {
    return err({ reason: "Failed to login", cause: error });
  }
}
const setAccessToken = (c, accessToken, maxAge) => setCookie(c, "token", accessToken, {
  ...getAuthCookieOptions(c),
  maxAge
});
const setRefreshToken = (c, refreshToken) => setCookie(c, "refresh_token", refreshToken, {
  ...getAuthCookieOptions(c),
  maxAge: 60 * 60 * 24 * 7
  // 7 days
});
const createUser = async (userId, email) => {
  return await db.insert(users).values({
    id: userId,
    email,
    firstName: null,
    lastName: null
  }).onConflictDoNothing({ target: users.id });
};
const getCreatorBySlug = (slug) => db.query.creators.findFirst({
  where: eq(creators.slug, slug)
});
const getCreatorByWebsite = (website) => db.query.creators.findFirst({
  where: eq(creators.website, normalizeUrl(website))
});
const createUserInDatabase = async (session, options) => {
  const { user } = session;
  const { id, email, user_metadata } = user;
  if (!email) {
    return err({ reason: "User has no email", cause: void 0 });
  }
  const { firstName, lastName } = user_metadata ?? {};
  try {
    const [newUser] = await db.insert(users).values({
      id,
      email,
      firstName,
      lastName,
      acceptsTerms: /* @__PURE__ */ new Date(),
      createdAt: /* @__PURE__ */ new Date(),
      mustResetPassword: options?.mustResetPassword ?? false
    }).onConflictDoUpdate({
      target: users.id,
      set: {
        ...firstName != null && { firstName },
        ...lastName != null && { lastName },
        createdAt: sql`COALESCE(${users.createdAt}, now())`,
        updatedAt: /* @__PURE__ */ new Date(),
        ...options?.mustResetPassword && { mustResetPassword: true }
      }
    }).returning();
    return ok(newUser);
  } catch (e) {
    return err({ reason: "Failed to create account", cause: e });
  }
};
function generateOtpSignupPassword() {
  return randomBytes(32).toString("base64url");
}
const verifyOtpForClaimSignup = async (c, formData, creatorId, verificationUrl) => {
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
          claimIntent: true
        }
      }
    });
    if (error) return err({ reason: error.message, cause: error });
    return ok(void 0);
  } catch (error) {
    return err({ reason: "Failed to verify OTP", cause: error });
  }
};
const verifyOtpForFanSignup = async (c, formData) => {
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
          lastName: formData?.lastName ?? null
        }
      }
    });
    if (error) return err({ reason: error.message, cause: error });
    return ok(void 0);
  } catch (error) {
    return err({ reason: "Failed to verify OTP", cause: error });
  }
};
const verifyOtpForCreatorSignup = async (c, formData) => {
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
          displayName: formData?.displayName ?? null
        }
      }
    });
    if (error) return err({ reason: error.message, cause: error });
    return ok(void 0);
  } catch (error) {
    return err({ reason: "Failed to verify OTP", cause: error });
  }
};
async function sendPasswordResetEmail(email) {
  try {
    const baseUrl = process.env.SITE_URL ?? "http://localhost:5173";
    const redirectTo = `${baseUrl.replace(/\/$/, "")}/auth/update-password`;
    const { error } = await supabaseAnon.auth.resetPasswordForEmail(email, {
      redirectTo
    });
    if (error) {
      console.error("Password reset email error:", error.message);
    }
    return ok(void 0);
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return ok(void 0);
  }
}
const clearMustResetPassword = async (userId) => {
  try {
    await db.update(users).set({ mustResetPassword: false }).where(eq(users.id, userId));
    return ok(void 0);
  } catch (error) {
    return err({ reason: "Failed to set reset password flag", cause: error });
  }
};
export {
  clearMustResetPassword,
  createUser,
  createUserInDatabase,
  getAuthCookieOptions,
  getCreatorBySlug,
  getCreatorByWebsite,
  getMustResetPasswordState,
  loginAndSetCookies,
  sendPasswordResetEmail,
  setAccessToken,
  setCookiesAndVerifyUser,
  setRefreshToken,
  verifyOtpForClaimSignup,
  verifyOtpForCreatorSignup,
  verifyOtpForFanSignup
};
