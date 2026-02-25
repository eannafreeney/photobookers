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

  setCookie(c, "token", data.session?.access_token, {
    httpOnly: true,
    maxAge: data.session.expires_in,
    path: "/",
  });

  setCookie(c, "refresh_token", data.session.refresh_token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

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
  const redirectUrl = c.req.query("redirectUrl");
  console.log("redirectUrl", redirectUrl);
  const safePath =
    redirectUrl &&
    !redirectUrl.startsWith("/auth/") &&
    redirectUrl.startsWith("/")
      ? redirectUrl
      : "/";
  const { error } = await supabaseAdmin.auth.signOut();

  if (error) return showErrorAlert(c);

  deleteCookie(c, "token");
  return c.redirect(safePath);
});

authRoutes.get("/reset-password", async (c) => {
  const user = await getUser(c);
  if (user) {
    return c.redirect("/");
  }

  const alpineAttrs = {
    "x-data": "resetPasswordForm()",
    // "x-on:submit": "submitForm($event)",
    // "x-target.away": "_top",
    "x-target": "toast",
    // "x-on:ajax:error": "isSubmitting = false",
  };

  return c.html(
    <Modal>
      <form action="/reset-password" method="post" {...alpineAttrs}>
        <Input
          type="password"
          label="Password"
          name="form.password"
          validateInput="validatePassword()"
          placeholder="••••••••"
          validationTrigger="blur"
          required
        />
        <Input
          type="password"
          label="Confirm Password"
          name="form.confirmPassword"
          validateInput="validateConfirmPassword()"
          placeholder="••••••••"
          validationTrigger="blur"
          required
        />
      </form>
    </Modal>,
  );
});

authRoutes.post("/reset-password", async (c) => {
  const user = await getUser(c);

  if (!user || !user.email) {
    return c.html(
      <Alert
        type="danger"
        message="You must be logged in to reset your password."
      />,
      401,
    );
  }

  // Use Supabase's password reset functionality
  const { error } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email: user.email,
    options: {
      redirectTo: `${c.req.url.split("/auth")[0]}/auth/reset-password/confirm`,
    },
  });

  if (error) {
    return c.html(
      <Alert
        type="danger"
        message="Failed to send password reset email. Please try again."
      />,
    );
  }

  return c.html(
    <Alert
      type="success"
      message="Password reset link has been sent to your email."
    />,
  );
});

// GET - Show password reset confirmation form (when user clicks email link)
authRoutes.get("/reset-password/confirm", async (c) => {
  const code = c.req.query("code");
  const token = c.req.query("token");

  if (!code || !token) {
    return c.html(<ErrorPage errorMessage="Invalid or missing reset token" />);
  }

  return c.html(<ResetPasswordConfirmPage code={code || token} />);
});

// POST - Update password after confirmation
authRoutes.post("/reset-password/confirm", async (c) => {
  const body = await c.req.parseBody();
  const code = body.code as string;
  const password = body.password as string;
  const confirmPassword = body.confirmPassword as string;

  if (!code || !password || !confirmPassword) {
    return c.html(
      <Alert type="danger" message="All fields are required" />,
      400,
    );
  }

  if (password !== confirmPassword) {
    return c.html(
      <Alert type="danger" message="Passwords do not match" />,
      400,
    );
  }

  if (password.length < 8) {
    return c.html(
      <Alert type="danger" message="Password must be at least 8 characters" />,
      400,
    );
  }

  const supabase = createSupabaseClient(c);

  // Exchange the code for a session and update password
  const { error: exchangeError, data } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !data.session) {
    return c.html(
      <ErrorPage
        errorMessage={exchangeError?.message || "Invalid or expired reset link"}
      />,
    );
  }

  // Update the password
  const { error: updateError } = await supabase.auth.updateUser({
    password: password,
  });

  if (updateError) {
    return c.html(<Alert type="danger" message={updateError.message} />, 400);
  }

  // Update session cookies
  setCookie(c, "token", data.session.access_token, {
    httpOnly: true,
    maxAge: data.session.expires_in,
    path: "/",
  });

  setCookie(c, "refresh_token", data.session.refresh_token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  await setFlash(c, "success", "Your password has been reset successfully!");

  return c.redirect("/");
});

export { authRoutes };
