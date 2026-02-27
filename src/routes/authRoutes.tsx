import { Hono } from "hono";
import {
  createSupabaseClient,
  supabaseAdmin,
  supabaseAnon,
} from "../lib/supabase";
import { db } from "../db/client";
import { users } from "../db/schema";
import { deleteCookie, setCookie } from "hono/cookie";
import RegisterPage from "../pages/auth/RegisterPage";
import { login } from "../middleware/auth";
import LoginPage from "../pages/auth/LoginPage";
import { getFlash, getUser, setFlash } from "../utils";
import AccountsPage from "../pages/auth/AccountsPage";
import Alert from "../components/app/Alert";
import ResetPasswordConfirmPage from "../pages/auth/ResetPasswordConfirmPage";
import ErrorPage from "../pages/error/errorPage";
import { formValidator, paramValidator } from "../lib/validator";
import {
  redirectUrlSchema,
  registerCreatorFormSchema,
  registerFanFormSchema,
  resendVerificationFormSchema,
  resetPasswordFormSchema,
  userIdSchema,
} from "../schemas";
import { normalizeUrl } from "../services/verification";
import { showErrorAlert } from "../lib/alertHelpers";
import { createClaim, deleteClaim } from "../services/claims";
import ResendVerificationPage from "../pages/auth/ResendVerificationPage";

import {
  createStubCreatorProfile,
  generateClaimEmail,
} from "../services/creators";
import Modal from "../components/app/Modal";
import Input from "../components/cms/ui/Input";
import ForceResetPasswordPage from "../pages/auth/ForceResetPasswordPage";
import { setAccessToken, setRefreshToken } from "../features/auth/services";
import ResetPasswordForm from "../components/cms/forms/ResetPasswordForm";
import MagicLinkHashHandlerPage from "../pages/auth/MagicLinkHashHandlerPage";

const authRoutes = new Hono();

authRoutes.get("/accounts", async (c) => {
  const user = await getUser(c);
  if (user) {
    return c.redirect("/");
  }
  return c.html(<AccountsPage />);
});

authRoutes.get("/login", async (c) => {
  const redirectUrl = c.req.query("redirectUrl") ?? null;
  const user = await getUser(c);
  const flash = await getFlash(c);
  if (user) {
    return c.redirect("/");
  }
  return c.html(<LoginPage redirectUrl={redirectUrl} flash={flash} />);
});

authRoutes.get("/register", async (c) => {
  const type = c.req.query("type") as "fan" | "artist" | "publisher";
  const user = await getUser(c);
  const redirectUrl = c.req.query("redirectUrl") ?? "";
  if (user) {
    return c.redirect("/");
  }
  return c.html(<RegisterPage type={type} redirectUrl={redirectUrl} />);
});

authRoutes.get("/resend-verification", async (c) => {
  const user = await getUser(c);
  if (user) {
    return c.redirect("/");
  }
  return c.html(<ResendVerificationPage />);
});

authRoutes.post(
  "/resend-verification",
  formValidator(resendVerificationFormSchema),
  async (c) => {
    const formData = c.req.valid("form");
    const email = formData.email as string;

    const baseUrl = process.env.SITE_URL ?? "http://localhost:5173";
    const emailRedirectTo = `${baseUrl.replace(/\/$/, "")}/auth/callback`;

    const { error } = await supabaseAnon.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo },
    });

    if (error) {
      return c.html(
        <Alert
          type="danger"
          message="We couldn’t send a new verification email. Check the address or try signing in if you’re already verified."
        />,
        400,
      );
    }

    await setFlash(
      c,
      "success",
      "If an unverified account exists for this email, we’ve sent a new verification link. Check your inbox and spam.",
    );
    return c.redirect("/auth/login");
  },
);

// Log in
authRoutes.post("/login", paramValidator(redirectUrlSchema), async (c) => {
  const body = await c.req.parseBody();
  const redirectUrl = c.req.valid("param").redirectUrl;
  const email = body.email as string;
  const password = body.password as string;
  const error = await login(c, email, password);

  const safeRedirectUrl =
    redirectUrl && redirectUrl !== "undefined" ? redirectUrl : "/";

  if (error) {
    return c.html(
      <Alert type="danger" message="Invalid email or password" />,
      401,
    );
  }
  return c.redirect(safeRedirectUrl ?? "/");
});

authRoutes.post(
  "/register-fan",
  paramValidator(redirectUrlSchema),
  formValidator(registerFanFormSchema),
  async (c) => {
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
      return c.html(
        <Alert
          type="danger"
          message={
            isAlreadyRegistered ? alreadyRegisteredMessage : error.message
          }
        />,
        401,
      );
    }

    // With email confirmation on, Supabase returns success but empty identities when email exists
    if (
      data.user &&
      (!data.user.identities || data.user.identities.length === 0)
    ) {
      return c.html(
        <Alert type="danger" message={alreadyRegisteredMessage} />,
        401,
      );
    }

    await setFlash(
      c,
      "success",
      `Hi ${data.user?.user_metadata?.firstName}! Your account has been created successfully. Check your email for verification.`,
    );
    return c.redirect("/");
  },
);

authRoutes.post(
  "/register-creator",
  formValidator(registerCreatorFormSchema),
  async (c) => {
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

    if (error) {
      return c.html(<Alert type="danger" message={error.message} />, 401);
    }

    const userId = data.user?.id;
    if (!userId) {
      return showErrorAlert(c, "Failed to create user. Please try again.");
    }

    // CREATE USER IN DB SO CLAIM AND CREATOR CAN REFERENCE THEM
    try {
      await db
        .insert(users)
        .values({
          id: userId,
          email: data.user?.email ?? email,
          firstName: null,
          lastName: null,
        })
        .onConflictDoNothing({ target: users.id });
    } catch (dbErr) {
      console.error("Database error on register-creator:", dbErr);
      return showErrorAlert(c, "Failed to create account. Please try again.");
    }

    // CREATE STUB CREATOR PROFILE
    let newCreator;
    try {
      newCreator = await createStubCreatorProfile(displayName, userId, type);
    } catch (error) {
      return showErrorAlert(
        c,
        "Failed to create stub creator profile. Please try again.",
      );
    }

    if (!newCreator) {
      return showErrorAlert(
        c,
        "Failed to create stub creator profile. Please try again.",
      );
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
        return showErrorAlert(
          c,
          "Failed to send verification email. Please try again.",
        );
      }
    } catch (error) {
      console.error("Email error:", error);
      await deleteClaim(claim.id);
      return showErrorAlert(
        c,
        "Failed to send verification email. Please try again.",
      );
    }

    // SET FLASH MESSAGE AND REDIRECT TO HOMEPAGE
    await setFlash(c, "success", "Please check your email for verification.");
    return c.redirect("/");
  },
);

function getCallbackErrorMessage(
  error: string | undefined,
  errorCode: string | undefined,
  errorDescription: string | undefined,
): string {
  if (
    errorCode === "otp_expired" ||
    errorDescription?.toLowerCase().includes("expired")
  ) {
    return "This verification link has expired or was already used. Please log in with your password, or register again to receive a new verification email.";
  }
  if (errorCode === "access_denied" || error === "access_denied") {
    return "This link is invalid or has expired. Please try logging in with your password, or register again to get a new verification email.";
  }
  if (error && errorDescription) {
    return errorDescription.replace(/\+/g, " ");
  }
  if (error) {
    return "Something went wrong with verification. Please try logging in or register again.";
  }
  return "No authorization code provided. If you were verifying your email, the link may have expired—please request a new one.";
}

authRoutes.get("/callback", async (c) => {
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

  setAccessToken(c, data.session?.access_token, data.session.expires_in);
  setRefreshToken(c, data.session.refresh_token);

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
});

// Log out
authRoutes.get("/logout", async (c) => {
  const user = await getUser(c);
  if (!user) return c.redirect("/auth/login");

  const { error } = await supabaseAdmin.auth.signOut();

  if (error) return c.html(<ErrorPage errorMessage="Failed to sign out" />);

  deleteCookie(c, "token");
  return c.redirect("/");
});

authRoutes.get("/force-reset-password", async (c) => {
  const user = await getUser(c);
  if (user) {
    // inavlidate current password
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: crypto.randomUUID(),
    });

    return c.html(<ForceResetPasswordPage user={user} />);
  }

  return c.html(<MagicLinkHashHandlerPage />);
});

authRoutes.get("/reset-password", async (c) => {
  const user = await getUser(c);
  if (!user) return c.redirect("/auth/login");

  const alpineAttrs = {
    "x-data": "resetPasswordForm()",
    "x-target": "toast",
    "x-on:submit": "submitForm($event)",
    "x-on:ajax:after": "$dispatch('dialog:close')",
    "x-on:ajax:error": "isSubmitting = false",
  };

  return c.html(
    <Modal title="Reset Password">
      <form action="/auth/reset-password" method="post" {...alpineAttrs}>
        <ResetPasswordForm />
      </form>
    </Modal>,
  );
});

authRoutes.post(
  "/reset-password",
  formValidator(resetPasswordFormSchema),
  async (c) => {
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

    setAccessToken(c, data.session.access_token, data.session.expires_in);
    setRefreshToken(c, data.session.refresh_token);

    await setFlash(c, "success", "Your password has been reset successfully!");
    return c.redirect("/");
  },
);

authRoutes.post("/set-session", async (c) => {
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

  setAccessToken(c, access_token, expires_in);
  setRefreshToken(c, refresh_token);

  return c.json({ ok: true });
});

export { authRoutes };
