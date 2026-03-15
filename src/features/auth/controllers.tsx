import { Context } from "hono";
import { getFlash, getUser, setFlash } from "../../utils";
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
  getAuthCookieOptions,
  getCreatorByDisplayName,
  getCreatorByWebsite,
  loginAndSetCookies,
  setCookiesAndVerifyUser,
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
import { getCallbackErrorMessage } from "./utils";
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
import { generateVerificationWelcomeEmail } from "./emails";

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
    "This email is already registered. Please log in.";

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

  const emailDomain = email.split("@")[1]?.toLowerCase() ?? "";
  const websiteHost = getHostname(verificationUrl);
  const domainsMatch = emailDomain.length > 0 && emailDomain === websiteHost;
  const claimStatus = domainsMatch ? "approved" : "pending_admin_review";
  // CREATE CLAIM
  let claim;
  try {
    claim = await createClaimWithStatus(
      userId,
      newCreator.id,
      verificationUrl,
      claimStatus,
    );
  } catch (error) {
    return showErrorAlert(c, "Failed to create claim. Please try again.");
  }
  // If auto-approved, assign the creator immediately
  if (claimStatus === "approved") {
    await assignUserAsCreatorOwnerAdmin(userId, newCreator.id, true);
  }
  // SEND EMAIL
  const origin = new URL(c.req.url).origin;
  const emailHtml = domainsMatch
    ? await generateClaimApprovalEmail(newCreator)
    : await generatePendingReviewEmail(newCreator);

  try {
    const { error } = await supabaseAdmin.functions.invoke("send-email", {
      body: {
        to: data.user?.email ?? email,
        subject: domainsMatch
          ? `Welcome to Photobookers, ${newCreator.displayName}!`
          : `Your claim for ${newCreator.displayName} is under review`,
        html: emailHtml,
      },
      headers: {
        "x-function-secret": process.env.FUNCTION_SECRET ?? "",
      },
    });
    if (error) {
      console.error("Failed to send email:", error);
      await deleteClaim(claim.id);
      return showErrorAlert(c, "Failed to send email. Please try again.");
    }
  } catch (error) {
    console.error("Email error:", error);
    await deleteClaim(claim.id);
    return showErrorAlert(c, "Failed to send email. Please try again.");
  }

  const flashMessage = domainsMatch
    ? "Account created! Check your email to log in and start managing your profile."
    : "Account created! Your creator profile is pending review — we'll notify you once approved.";
  await setFlash(c, "success", flashMessage);
  return c.redirect("/");
};

export const processRegister = async (c: Context) => {
  const tokenHash = c.req.query("token_hash");
  const redirectUrl = c.req.query("redirectUrl");
  const error = c.req.query("error");
  const errorCode = c.req.query("error_code");
  const errorDescription = c.req.query("error_description");

  if (error || errorCode) {
    const message = getCallbackErrorMessage(error, errorCode, errorDescription);
    return c.html(<ErrorPage errorMessage={message} />);
  }

  if (!tokenHash) {
    return c.html(
      <ErrorPage
        errorMessage={getCallbackErrorMessage(undefined, undefined, undefined)}
      />,
    );
  }

  const supabase = createSupabaseClient(c);
  const { error: authError, data } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "signup",
  });
  if (authError || !data?.session) {
    console.error("Failed to create session:", authError?.message);
    return c.html(
      <ErrorPage
        errorMessage={authError?.message || "Failed to create session"}
      />,
    );
  }

  const { access_token, refresh_token, expires_in } = data.session;

  await setCookiesAndVerifyUser(
    c,
    access_token,
    refresh_token,
    expires_in,
    data.user?.id ?? "",
  );

  // Now get user from the session (no need for another getUser call)
  const user = data.session.user;
  const firstName = user.user_metadata?.firstName ?? null;
  const lastName = user.user_metadata?.lastName ?? null;

  // Create user in database
  try {
    await db
      .insert(users)
      .values({
        id: user.id,
        email: user.email!,
        firstName,
        lastName,
      })
      .onConflictDoUpdate({ target: users.id, set: { firstName, lastName } });
  } catch (dbError) {
    console.error("Database error during callback:", dbError);
    return c.html(
      <ErrorPage errorMessage="Failed to create account. Please try again." />,
    );
  }

  console.log("about to send email");

  try {
    await supabaseAdmin.functions.invoke("send-email", {
      body: {
        to: user.email!,
        subject: "You're verified – welcome to Photobookers",
        html: generateVerificationWelcomeEmail(firstName),
      },
    });
  } catch (error) {
    console.error("Verification welcome email failed:", error);
  }

  console.log("email sent. about to flash");

  await setFlash(
    c,
    "success",
    `Hi ${user.user_metadata?.firstName ?? "there"}! Your account has been verified successfully. Have fun!`,
  );

  return c.redirect(redirectUrl ?? "/");
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

  await setCookiesAndVerifyUser(
    c,
    data.session.access_token,
    data.session.refresh_token,
    data.session.expires_in,
    data.user.id,
  );

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

  await setCookiesAndVerifyUser(
    c,
    access_token,
    refresh_token,
    expires_in,
    user.id,
  );

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

  const existingCreator = await getCreatorByDisplayName(displayName);
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
