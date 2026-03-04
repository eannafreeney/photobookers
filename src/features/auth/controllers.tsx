import { Context } from "hono";
import { getFlash, getUser, setFlash } from "../../utils";
import AccountsPage from "./pages/AccountsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResendVerificationPage from "./pages/ResendVerificationPage";
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
  ValidateDisplayNameContext,
  ValidateEmailContext,
  ValidateWebsiteContext,
  VerificationFormContext,
} from "./types";
import {
  createUser,
  getCreatorByDisplayName,
  getCreatorByWebsite,
  loginAndSetCookies,
  setCookiesAndVerifyUser,
} from "./services";
import { normalizeUrl } from "../../services/verification";
import { createClaim, deleteClaim } from "../claims/services";
import { generateClaimEmail } from "../claims/emails";
import ErrorPage from "../../pages/error/errorPage";
import { db } from "../../db/client";
import { users } from "../../db/schema";
import { getCallbackErrorMessage } from "./utils";
import { deleteCookie } from "hono/cookie";
import ForceResetPasswordPage from "./pages/SetNewPasswordPage";
import MagicLinkHashHandlerPage from "./pages/MagicLinkHashHandlerPage";
import ResetPasswordModal from "./modals/ResetPasswordModal";
import ValidateEmail from "./components/ValidateEmail";
import ValidateDisplayName from "./components/ValidateDisplayName";
import ValidateWebsite from "./components/ValidateWebsite";
import { createStubCreatorProfile } from "../dashboard/creators/services";
import { findUserByEmailAdmin } from "../dashboard/admin/creators/services";

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

export const getResendVerificationEmailPage = async (c: Context) => {
  const user = await getUser(c);
  if (user) return c.redirect("/");
  return c.html(<ResendVerificationPage />);
};

export const resendVerificationEmail = async (c: VerificationFormContext) => {
  const formData = c.req.valid("form");
  const email = formData.email as string;

  const baseUrl = process.env.SITE_URL ?? "http://localhost:5173";
  const emailRedirectTo = `${baseUrl.replace(/\/$/, "")}/auth/callback`;

  const { error } = await supabaseAnon.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo },
  });

  if (error)
    showErrorAlert(
      c,
      "We couldn’t send a new verification email. Check the address or try signing in if you’re already verified.",
      400,
    );

  await setFlash(
    c,
    "success",
    "If an unverified account exists for this email, we’ve sent a new verification link. Check your inbox and spam.",
  );
  return c.redirect("/auth/login");
};

export const login = async (c: LoginFormContext) => {
  const formData = c.req.valid("form");
  const redirectUrl = c.req.valid("param").redirectUrl;
  const email = formData.email as string;
  const password = formData.password as string;
  const error = await loginAndSetCookies(c, email, password);

  const safeRedirectUrl =
    redirectUrl && redirectUrl !== "undefined" ? redirectUrl : "/";

  if (error) return showErrorAlert(c, "nvalid email or password", 401);

  return c.redirect(safeRedirectUrl ?? "/");
};

export const registerFan = async (c: RegisterFanFormContext) => {
  const formData = c.req.valid("form");
  const redirectUrl = c.req.valid("param").redirectUrl;
  const firstName = formData.firstName as string;
  const lastName = formData.lastName as string;
  const email = formData.email as string;
  const password = formData.password as string;

  const supabase = createSupabaseClient(c);

  const baseUrl = process.env.SITE_URL ?? "http://localhost:5173"; // fallback for dev
  const emailRedirectTo = `${baseUrl.replace(/\/$/, "")}/auth/callback${redirectUrl ? `?redirectUrl=${redirectUrl}` : ""}`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: {
        firstName: firstName ?? null,
        lastName: lastName ?? null,
      },
    },
  });

  const alreadyRegisteredMessage =
    "This email is already registered. Please log in, or use 'Resend verification email' if you didn't receive the first one.";

  if (error) {
    const isAlreadyRegistered =
      error.message?.toLowerCase().includes("already") ||
      error.message?.toLowerCase().includes("registered") ||
      error.code === "user_already_exists";
    return showErrorAlert(
      c,
      isAlreadyRegistered ? alreadyRegisteredMessage : error.message,
    );
  }

  // With email confirmation on, Supabase returns success but empty identities when email exists
  if (data.user && (!data.user.identities || data.user.identities.length === 0))
    return showErrorAlert(c, alreadyRegisteredMessage);

  await setFlash(
    c,
    "success",
    `Hi ${data.user?.user_metadata?.firstName}! Your account has been created successfully. Check your email for verification.`,
  );
  return c.redirect("/");
};

export const registerCreator = async (c: RegisterCreatorFormContext) => {
  // GET FORM DATA
  const formData = c.req.valid("form");
  const displayName = formData.displayName as string;
  const website = formData.website as string;
  const email = formData.email as string;
  const password = formData.password as string;
  const type = formData.type as "artist" | "publisher";

  if (!displayName?.trim() || !website?.trim()) {
    return showErrorAlert(c, "Display name and website are required.");
  }

  // Normalize and validate URL
  const verificationUrl = normalizeUrl(website);

  // CREATE USER IN SUPABASE
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      displayName: displayName.trim(),
      website: verificationUrl,
    },
  });

  if (error) return showErrorAlert(c, error.message);

  const userId = data.user?.id;
  if (!userId) return showErrorAlert(c, "Failed to create user.");

  // CREATE USER IN DB SO CLAIM AND CREATOR CAN REFERENCE THEM
  try {
    createUser(userId, data.user?.email ?? email);
  } catch (dbErr) {
    console.error("Database error on register-creator:", dbErr);
    return showErrorAlert(c, "Failed to create account.");
  }

  // CREATE STUB CREATOR PROFILE
  let newCreator;
  try {
    newCreator = await createStubCreatorProfile(displayName, userId, type);
  } catch (error) {
    return showErrorAlert(c, "Failed to create stub creator profile.");
  }

  if (!newCreator) {
    return showErrorAlert(c, "Failed to create stub creator profile.");
  }

  // CREATE CLAIM
  let claim;
  try {
    claim = await createClaim(
      userId,
      newCreator.id,
      verificationUrl,
      "website",
    );
  } catch (error) {
    return showErrorAlert(c, "Failed to create claim. Please try again.");
  }

  // SEND VERIFICATION EMAIL
  const origin = new URL(c.req.url).origin;
  const verificationLink = `${origin}/claim/verify/${claim.verificationToken}`;

  const emailHtml = await generateClaimEmail(
    claim,
    newCreator,
    verificationUrl,
    verificationLink,
  );

  try {
    const { error } = await supabaseAdmin.functions.invoke("send-email", {
      body: {
        to: data.user?.email ?? email,
        subject: `Verify Your Website for ${newCreator.displayName}`,
        html: emailHtml,
      },
      headers: {
        "x-function-secret": process.env.FUNCTION_SECRET ?? "",
      },
    });

    if (error) {
      console.error("Failed to send email:", error);
      await deleteClaim(claim.id);
      return showErrorAlert(c, "Failed to send verification email.");
    }
  } catch (error) {
    console.error("Email error:", error);
    await deleteClaim(claim.id);
    return showErrorAlert(c, "Failed to send verification email.");
  }

  // SET FLASH MESSAGE AND REDIRECT TO HOMEPAGE
  await setFlash(c, "success", "Please check your email for verification.");
  return c.redirect("/");
};

export const processRegister = async (c: Context) => {
  const code = c.req.query("code");
  const redirectUrl = c.req.query("redirectUrl");
  const error = c.req.query("error");
  const errorCode = c.req.query("error_code");
  const errorDescription = c.req.query("error_description");

  if (error || errorCode) {
    const message = getCallbackErrorMessage(error, errorCode, errorDescription);
    return c.html(<ErrorPage errorMessage={message} />);
  }

  if (!code) {
    return c.html(
      <ErrorPage
        errorMessage={getCallbackErrorMessage(undefined, undefined, undefined)}
      />,
    );
  }

  // Create SSR client that uses cookies
  const supabase = createSupabaseClient(c);

  const { error: exchangeError, data } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !data.session) {
    return c.html(
      <ErrorPage
        errorMessage={exchangeError?.message || "Failed to create session"}
      />,
    );
  }

  const { access_token, refresh_token, expires_in } = data.session;

  await setCookiesAndVerifyUser(
    c,
    access_token,
    refresh_token,
    expires_in,
    data.user.id,
  );

  // Now get user from the session (no need for another getUser call)
  const user = data.session.user;

  // Create user in database
  try {
    await db
      .insert(users)
      .values({
        id: user.id,
        email: user.email!,
        firstName: user.user_metadata?.firstName || null,
        lastName: user.user_metadata?.lastName || null,
      })
      .onConflictDoNothing({ target: users.id });
  } catch (dbError) {
    console.error("Database error during callback:", dbError);
    return c.html(
      <ErrorPage errorMessage="Failed to create account. Please try again." />,
    );
  }

  await setFlash(
    c,
    "success",
    `Hi ${user.user_metadata?.firstName ?? "there"}! Your account has been verified successfully. Have fun!`,
  );

  return c.redirect(redirectUrl ?? "/");
};

export const logout = async (c: Context) => {
  const user = await getUser(c);
  if (!user) return c.redirect("/auth/login");

  const { error } = await supabaseAdmin.auth.signOut();

  if (error) return showErrorAlert(c);

  deleteCookie(c, "token");
  return c.redirect("/");
};

export const getSetNewPasswordPage = async (c: Context) => {
  const user = await getUser(c);
  if (user) {
    return c.html(<ForceResetPasswordPage user={user} />);
  }
  return c.html(<MagicLinkHashHandlerPage />);
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

  const { data } = await supabaseAnon.auth.signInWithPassword({
    email: user.email,
    password,
  });

  if (!data.session) return showErrorAlert(c, "Failed to sign in");

  await setCookiesAndVerifyUser(
    c,
    data.session.access_token,
    data.session.refresh_token,
    data.session.expires_in,
    data.user.id,
  );

  console.log("user", data.user);

  await setFlash(c, "success", "Your password has been reset successfully!");
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

  try {
    await db
      .insert(users)
      .values({
        id: user.id,
        email: user.email!,
        firstName: user.user_metadata?.firstName ?? null,
        lastName: user.user_metadata?.lastName ?? null,
      })
      .onConflictDoNothing({ target: users.id });
  } catch (dbError) {
    console.error("Database error during set-session:", dbError);
    return c.json(
      { error: "Failed to create account. Please try again." },
      500,
    );
  }

  await setCookiesAndVerifyUser(
    c,
    access_token,
    refresh_token,
    expires_in,
    user.id,
  );

  return c.json({ ok: true });
};

export const validateEmail = async (c: ValidateEmailContext) => {
  const email = c.req.valid("form").email;

  const existingUser = await findUserByEmailAdmin(email);
  const isAvailable = !Boolean(existingUser);

  return c.html(<ValidateEmail isAvailable={isAvailable} />);
};

export const validateDisplayName = async (c: ValidateDisplayNameContext) => {
  const displayName = c.req.valid("form").displayName;

  const existingCreator = await getCreatorByDisplayName(displayName);
  const isAvailable = !Boolean(existingCreator);

  return c.html(<ValidateDisplayName isAvailable={isAvailable} />);
};

export const validateWebsite = async (c: ValidateWebsiteContext) => {
  const website = c.req.valid("form").website;

  const existingWebsite = await getCreatorByWebsite(website);
  const isAvailable = !Boolean(existingWebsite);

  return c.html(<ValidateWebsite isAvailable={isAvailable} />);
};
