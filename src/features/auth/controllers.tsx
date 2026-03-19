import { Context } from "hono";
import { getFlash, getUser, setFlash, slugify } from "../../utils";
import AccountsPage from "./pages/AccountsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import {
  createSupabaseClient,
  supabaseAdmin,
  supabaseAnon,
} from "../../lib/supabase";
import { showErrorAlert } from "../../lib/alertHelpers";
import {
  LoginFormContext,
  RegisterCreatorFormContext,
  RegisterFanFormContext,
  ResetPasswordFormContext,
} from "./types";
import {
  createUser,
  createUserInDatabase,
  getAuthCookieOptions,
  getCreatorBySlug,
  getCreatorByWebsite,
  loginAndSetCookies,
  setCookiesAndVerifyUser,
  verifyOtpForCreatorSignup,
  verifyOtpForFanSignup,
} from "./services";
import { getHostname, normalizeUrl } from "../../services/verification";
import { createClaimWithStatus, deleteClaim } from "../claims/services";
import {
  generateClaimApprovalEmail,
  generatePendingReviewEmail,
} from "../claims/emails";
import ErrorPage from "../../pages/error/errorPage";
import { db } from "../../db/client";
import { users } from "../../db/schema";
import { getCallbackErrorMessage, verifyOtpForSignup } from "./utils";
import { deleteCookie, getCookie } from "hono/cookie";
import ForceResetPasswordPage from "./pages/SetNewPasswordPage";
import ResetPasswordModal from "./modals/ResetPasswordModal";
import ValidateEmail from "./components/ValidateEmail";
import ValidateDisplayName from "./components/ValidateDisplayName";
import ValidateWebsite from "./components/ValidateWebsite";
import { createStubCreatorProfile } from "../dashboard/creators/services";
import { findUserByEmailAdmin } from "../dashboard/admin/creators/services";
import { eq } from "drizzle-orm";
import { assignUserAsCreatorOwnerAdmin } from "../dashboard/admin/claims/services";
import {
  generateCreatorNotificationEmail,
  generateFanNotificationEmail,
  generateVerificationSuccessEmailAdmin,
  generateVerificationWelcomeEmail,
} from "./emails";
import { sendAdminEmail, sendEmail } from "../../lib/sendEmail";
import { isErr, isOk } from "../../lib/result";
import RegisterSuccessScreen from "./components/RegisterSuccessScreen";

export const getAccountsPage = async (c: Context) => {
  const user = await getUser(c);
  if (user) return c.redirect("/");
  return c.html(<AccountsPage />);
};

export const getLoginPage = async (c: Context) => {
  const redirectUrl = c.req.query("redirectUrl") ?? null;
  const user = await getUser(c);
  const flash = await getFlash(c);
  if (user) return c.redirect("/");
  return c.html(<LoginPage redirectUrl={redirectUrl} flash={flash} />);
};

export const getRegisterPage = async (c: Context) => {
  const type = c.req.query("type") as "fan" | "artist" | "publisher";
  const user = await getUser(c);
  const redirectUrl = c.req.query("redirectUrl") ?? "";
  if (user) return c.redirect("/");
  return c.html(<RegisterPage type={type} redirectUrl={redirectUrl} />);
};

export const login = async (c: LoginFormContext) => {
  const formData = c.req.valid("form");
  const redirectUrl = c.req.valid("param").redirectUrl;
  const email = formData.email as string;
  const password = formData.password as string;
  const result = await loginAndSetCookies(c, email, password);

  const safeRedirectUrl =
    redirectUrl && redirectUrl !== "undefined" ? redirectUrl : "/";

  if ("error" in result)
    return showErrorAlert(c, "Invalid email or password", 401);

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, result.userId),
    columns: { mustResetPassword: true },
  });
  if (dbUser?.mustResetPassword) {
    return c.redirect("/auth/force-reset-password");
  }

  return c.redirect(safeRedirectUrl ?? "/");
};

export const registerFan = async (c: RegisterFanFormContext) => {
  const formData = c.req.valid("form");

  const [verifyOtpError] = await verifyOtpForFanSignup(c, formData);
  if (verifyOtpError) return showErrorAlert(c, verifyOtpError.reason);

  return c.html(<RegisterSuccessScreen />);
};

export const registerCreator = async (c: RegisterCreatorFormContext) => {
  const formData = c.req.valid("form");

  const [verifyOtpError] = await verifyOtpForCreatorSignup(c, formData);
  if (verifyOtpError) return showErrorAlert(c, verifyOtpError.reason);

  return c.html(<RegisterSuccessScreen />);
};

export const processRegister = async (c: Context) => {
  const tokenHash = c.req.query("token_hash");
  const error = c.req.query("error");
  const errorCode = c.req.query("error_code");
  const errorDescription = c.req.query("error_description");

  if (error || errorCode) {
    const message = getCallbackErrorMessage(error, errorCode, errorDescription);
    return c.html(<ErrorPage errorMessage={message} />);
  }

  if (!tokenHash)
    return c.html(<ErrorPage errorMessage={getCallbackErrorMessage()} />);

  const [signupError, session] = await verifyOtpForSignup(c, tokenHash);
  if (signupError)
    return c.html(<ErrorPage errorMessage={signupError.reason} />);

  const { user } = session;
  const type = user.user_metadata?.type as string | undefined;
  const isCreator = type === "artist" || type === "publisher";

  await setCookiesAndVerifyUser(c, session);

  if (!user.email)
    return c.html(
      <ErrorPage errorMessage="Failed to create account. Please try again." />,
    );

  const [dbError] = await createUserInDatabase(session);
  if (dbError) return c.html(<ErrorPage errorMessage={dbError.reason} />);

  if (isCreator) {
    const [newCreatorError] = await createStubCreatorProfile(session);
    if (newCreatorError)
      return c.html(<ErrorPage errorMessage={newCreatorError.reason} />);
  }

  const adminEmailResult = await sendAdminEmail(
    "New user verified",
    generateVerificationSuccessEmailAdmin(user.email),
  );
  if (isErr(adminEmailResult))
    console.error(
      "Admin verification email failed:",
      adminEmailResult[0].reason,
    );

  const welcomeName = isCreator
    ? (user.user_metadata?.displayName ?? null)
    : (user.user_metadata?.firstName ?? null);

  const emailResult = await sendEmail(
    user.email,
    "You're verified – welcome to Photobookers",
    generateVerificationWelcomeEmail(welcomeName),
  );

  if (isErr(emailResult))
    console.error("Verification welcome email failed:", emailResult[0].reason);

  await setFlash(c, "success", "Account Verified. Welcome to Photobookers!");
  return c.redirect("/");
};

export const logout = async (c: Context) => {
  const user = await getUser(c);
  const jwt = getCookie(c, "token");
  if (!user) return c.redirect("/auth/login");

  const cookieOpts = getAuthCookieOptions();
  deleteCookie(c, "token", {
    path: cookieOpts.path,
    domain: cookieOpts.domain,
  });
  deleteCookie(c, "refresh_token", {
    path: cookieOpts.path,
    domain: cookieOpts.domain,
  });

  if (jwt) {
    const { error } = await supabaseAdmin.auth.admin.signOut(jwt);
    if (error) console.error("Failed to revoke session:", error);
    if (error) return showErrorAlert(c);
  }

  return c.redirect("/");
};

export const getSetNewPasswordPage = async (c: Context) => {
  const user = await getUser(c);
  return c.html(<ForceResetPasswordPage user={user} />);
};

export const getResetPasswordModal = async (c: Context) => {
  const user = await getUser(c);
  if (!user) return c.redirect("/auth/login");
  return c.html(<ResetPasswordModal />);
};

export const resetPassword = async (c: ResetPasswordFormContext) => {
  const user = await getUser(c);
  if (!user) return c.redirect("/auth/login");

  const formData = c.req.valid("form");
  const password = formData.password as string;
  const confirmPassword = formData.confirmPassword as string;

  if (password !== confirmPassword)
    return showErrorAlert(c, "Passwords do not match");
  if (password.length < 8)
    return showErrorAlert(c, "Password must be at least 8 characters");

  const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    password,
  });

  if (error) return showErrorAlert(c, error.message);

  await db
    .update(users)
    .set({ mustResetPassword: false })
    .where(eq(users.id, user.id));

  const { data } = await supabaseAnon.auth.signInWithPassword({
    email: user.email,
    password,
  });

  if (!data.session) return showErrorAlert(c, "Failed to sign in");

  await setCookiesAndVerifyUser(c, data.session);

  await setFlash(c, "success", "Your password has been updated successfully!");
  return c.redirect("/");
};

export const setSession = async (c: Context) => {
  let body: {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid body" }, 400);
  }
  const access_token = body.access_token;
  const refresh_token = body.refresh_token ?? "";
  const expires_in =
    typeof body.expires_in === "number" ? body.expires_in : 3600;

  if (!access_token || typeof access_token !== "string") {
    return c.json({ error: "Missing access_token" }, 400);
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(access_token);
  if (error || !user) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }

  const firstName = user.user_metadata?.firstName ?? null;
  const lastName = user.user_metadata?.lastName ?? null;

  try {
    await db
      .insert(users)
      .values({
        id: user.id,
        email: user.email!,
        firstName,
        lastName,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: { firstName, lastName },
      });
  } catch (dbError) {
    console.error("Database error during set-session:", dbError);
    return c.json(
      { error: "Failed to create account. Please try again." },
      500,
    );
  }

  await setCookiesAndVerifyUser(c, {
    access_token,
    refresh_token,
    expires_in,
    user,
    token_type: "bearer",
  });

  return c.json({ ok: true });
};

export const validateEmail = async (c: Context) => {
  const body = await c.req.parseBody();
  const email = body["email"] as string | undefined;
  if (!email) return c.html(<ValidateEmail />);

  const normalizedEmail = email.trim().toLowerCase();

  let existsInAuth = false;
  try {
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000,
      page: 1,
    });
    existsInAuth = authData?.users?.some(
      (u) => u.email?.toLowerCase() === normalizedEmail,
    );
  } catch (error) {
    console.error("Failed to check if email exists in Supabase Auth:", error);
    return c.html(<ValidateEmail />);
  }

  const existingUser = await findUserByEmailAdmin(email);
  const isAvailable = !existsInAuth && !existingUser;

  return c.html(<ValidateEmail isAvailable={isAvailable} />);
};

export const validateDisplayName = async (c: Context) => {
  const body = await c.req.parseBody();
  const displayName = body["displayName"] as string | undefined;
  if (!displayName) return c.html(<ValidateDisplayName />);

  // const existingCreator = await getCreatorByDisplayName(displayName);
  const slug = slugify(displayName.trim());
  const existingCreator = await getCreatorBySlug(slug);
  const isAvailable = !Boolean(existingCreator);

  return c.html(<ValidateDisplayName isAvailable={isAvailable} />);
};

export const validateWebsite = async (c: Context) => {
  const body = await c.req.parseBody();
  const website = body["website"] as string | undefined;
  if (!website) return c.html(<ValidateWebsite />);

  const existingWebsite = await getCreatorByWebsite(website);
  const isAvailable = !Boolean(existingWebsite);

  return c.html(<ValidateWebsite isAvailable={isAvailable} />);
};
