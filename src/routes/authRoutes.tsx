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
import { getUser, setFlash } from "../utils";
import AccountsPage from "../pages/auth/AccountsPage";
import Alert from "../components/app/Alert";
import ResetPasswordConfirmPage from "../pages/auth/ResetPasswordConfirmPage";
import ErrorPage from "../pages/error/errorPage";
import { formValidator } from "../lib/validator";
import { registerCreatorFormSchema } from "../schemas";
import { normalizeUrl } from "../services/verification";
import { showErrorAlert } from "../lib/alertHelpers";
import { createClaim, deleteClaim } from "../services/claims";
import {
  createStubCreatorProfile,
  generateClaimEmail,
} from "../services/creators";

const authRoutes = new Hono();

authRoutes.get("/accounts", async (c) => {
  const user = await getUser(c);
  if (user) {
    return c.redirect("/");
  }
  return c.html(<AccountsPage />);
});

authRoutes.get("/login", async (c) => {
  const redirectUrl = c.req.query("redirectUrl");
  const user = await getUser(c);
  if (user) {
    return c.redirect("/");
  }
  return c.html(<LoginPage redirectUrl={redirectUrl} />);
});

authRoutes.get("/register", async (c) => {
  const type = c.req.query("type") as "fan" | "artist" | "publisher";
  const user = await getUser(c);
  if (user) {
    return c.redirect("/");
  }
  return c.html(<RegisterPage type={type} />);
});

// Log in
authRoutes.post("/login", async (c) => {
  const body = await c.req.parseBody();
  const redirectUrl = c.req.query("redirectUrl");
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

authRoutes.post("/register-fan", async (c) => {
  const body = await c.req.parseBody();
  const firstName = body.firstName as string;
  const lastName = body.lastName as string;
  const email = body.email as string;
  const password = body.password as string;
  const type = body.type as "fan";

  const supabase = createSupabaseClient(c);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `http://localhost:5173/auth/callback?type=fan`,
      data: {
        firstName: firstName ?? null,
        lastName: lastName ?? null,
      },
    },
  });

  if (error) {
    return c.html(<Alert type="danger" message={error.message} />, 401);
  }

  await setFlash(
    c,
    "success",
    `Hi ${data.user?.user_metadata?.firstName}! Your account has been created successfully. Check your email for verification.`,
  );
  return c.redirect("/");
});

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

// authRoutes.get("/callback", async (c) => {
//   const code = c.req.query("code");

//   if (!code) {
//     return c.html(<ErrorPage errorMessage="No authorization code provided" />);
//   }

//   // Create SSR client that uses cookies
//   const supabase = createSupabaseClient(c);

//   const { error: exchangeError, data } =
//     await supabase.auth.exchangeCodeForSession(code);

//   if (exchangeError || !data.session) {
//     return c.html(
//       <ErrorPage
//         errorMessage={exchangeError?.message || "Failed to create session"}
//       />,
//     );
//   }

//   setCookie(c, "token", data.session?.access_token, {
//     httpOnly: true,
//     maxAge: data.session.expires_in,
//     path: "/",
//   });

//   setCookie(c, "refresh_token", data.session.refresh_token, {
//     httpOnly: true,
//     maxAge: 60 * 60 * 24 * 7, // 7 days
//     path: "/",
//   });

//   // Now get user from the session (no need for another getUser call)
//   const user = data.session.user;

//   const validTypes = ["artist", "fan", "publisher"] as const;
//   const type = c.req.query("type");
//   const safeType = validTypes.includes(type as (typeof validTypes)[number])
//     ? type
//     : "fan";

//   // Create user in database
//   try {
//     await db
//       .insert(users)
//       .values({
//         id: user.id,
//         email: user.email!,
//         firstName: user.user_metadata?.firstName || null,
//         lastName: user.user_metadata?.lastName || null,
//       })
//       .onConflictDoNothing({ target: users.id });
//   } catch (dbError) {
//     console.error("Database error during callback:", dbError);
//     return c.html(
//       <ErrorPage errorMessage="Failed to create account. Please try again." />,
//     );
//   }

//   // Store the intended creator type in user metadata if not already set
//   if (safeType === "artist" || safeType === "publisher") {
//     const { error: updateError } = await supabase.auth.updateUser({
//       data: {
//         displayName: user.user_metadata?.displayName || null,
//         website: user.user_metadata?.website || null,
//       },
//     });
//     if (updateError) {
//       console.error("Failed to update user metadata:", updateError);
//     }
//   }

//   if (!safeType) {
//     return c.redirect("/register/accounts");
//   }

//   await setFlash(
//     c,
//     "success",
//     `Hi ${
//       safeType === "artist" || safeType === "publisher"
//         ? (data.user?.user_metadata?.displayName ?? "there")
//         : (data.user?.user_metadata?.firstName ?? "there")
//     }! Your account has been verified successfully. Have fun!`,
//   );

//   const redirectMap: Record<string, string> = {
//     artist: "/dashboard/creators/new?type=artist",
//     publisher: "/dashboard/creators/new?type=publisher",
//     fan: "/",
//   };

//   return c.redirect(redirectMap[safeType] ?? "/");
// });

// Log out
authRoutes.get("/logout", async (c) => {
  const { error } = await supabaseAdmin.auth.signOut();

  if (error) {
    return c.json({ error: error.message }, 401);
  }

  deleteCookie(c, "token");
  return c.redirect("/");
});

// GET - Show reset password form
// authRoutes.get("/reset-password", async (c) => {
//   const user = await getUser(c);
//   if (user) {
//     return c.redirect("/");
//   }
//   return c.html(<ResetPasswordPage />);
// });

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
