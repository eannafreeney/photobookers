import { Hono } from "hono";
import { createSupabaseClient, supabaseAdmin } from "../lib/supabase";
import { db } from "../db/client";
import { users } from "../db/schema";
import { deleteCookie, setCookie } from "hono/cookie";
import RegisterPage from "../pages/auth/RegisterPage";
import { login } from "../middleware/auth";
import LoginPage from "../pages/auth/LoginPage";
import { getUser, setFlash } from "../utils";
import AccountsPage from "../pages/auth/AccountsPage";
import Alert from "../components/app/Alert";
import Page from "../components/layouts/Page";
import AppLayout from "../components/layouts/AppLayout";
import ResetPasswordConfirmPage from "../pages/auth/ResetPasswordConfirmPage";

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
      401
    );
  }
  return c.redirect(safeRedirectUrl ?? "/");
});

const ErrorPage = ({ errorMessage }: { errorMessage: string }) => (
  <AppLayout title="Error">
    <Page>
      <div class="flex flex-col items-center justify-center min-h-screen">
        <div class="text-center text-2xl font-medium">{errorMessage}</div>
      </div>
    </Page>
  </AppLayout>
);

authRoutes.post("/register", async (c) => {
  const body = await c.req.parseBody();
  const firstName = body.firstName as string | undefined;
  const lastName = body.lastName as string | undefined;
  const email = body.email as string;
  const password = body.password as string;
  const type = body.type as "fan" | "artist" | "publisher";

  const supabase = createSupabaseClient(c);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `http://localhost:5173/auth/callback?type=${type}`,
      data: {
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        intendedCreatorType: type === "artist" || type === "publisher" ? type : null,
      },
    },
  });

 
  if (error) {
    return c.html(<Alert type="danger" message={error.message} />, 401);
  }


  await setFlash(
    c,
    "success",
    `Hi ${type === "fan" ? `${data.user?.user_metadata?.firstName}` : "there"}! Your account has been created successfully. Check your email for verification.`
  );
  return c.redirect("/");
});

authRoutes.get("/callback", async (c) => {
  const code = c.req.query("code");

  if (!code) {
    return c.html(<ErrorPage errorMessage="No authorization code provided" />);
  }

  // Create SSR client that uses cookies
  const supabase = createSupabaseClient(c);

  const { error: exchangeError, data } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !data.session) {
    return c.html(
      <ErrorPage
        errorMessage={exchangeError?.message || "Failed to create session"}
      />
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

  const validTypes = ["artist", "fan", "publisher"] as const;
  const type = c.req.query("type");
  const safeType = validTypes.includes(type as (typeof validTypes)[number])
    ? type
    : "fan";

  // Check if user already exists in database
  try {
    const intendedType = safeType === "artist" || safeType === "publisher" 
    ? safeType 
    : null;
    
    await db
      .insert(users)
      .values({
        id: user.id,
        email: user.email!,
        firstName: user.user_metadata?.firstName || null,
        lastName: user.user_metadata?.lastName || null,
        intendedCreatorType: intendedType,
      })
      .onConflictDoNothing({ target: users.id });
  } catch (dbError) {
    console.error("Database error during callback:", dbError);
    return c.html(
      <ErrorPage errorMessage="Failed to create account. Please try again." />
    );
  }

  

// Store the intended creator type in user metadata if not already set
if (safeType === "artist" || safeType === "publisher") {
  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      intendedCreatorType: safeType,
      // Preserve existing metadata
      firstName: user.user_metadata?.firstName || null,
      lastName: user.user_metadata?.lastName || null,
    },
  });
  if (updateError) {
    console.error("Failed to update user metadata:", updateError);
  }
}

  if (!safeType) {
    return c.redirect("/register/accounts");
  }

  await setFlash(
    c,
    "success",
    `Hi ${
      data.user?.user_metadata?.firstName ?? "there"
    }! Your account has been verified successfully. Have fun!`
  );

  const redirectMap: Record<string, string> = {
    artist: "/dashboard/creators/new?type=artist",
    publisher: "/dashboard/creators/new?type=publisher",
    fan: "/",
  };

  return c.redirect(redirectMap[safeType] ?? "/");
});

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
      <Alert type="danger" message="You must be logged in to reset your password." />,
      401
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
      <Alert type="danger" message="Failed to send password reset email. Please try again." />
    );
  }

  return c.html(
    <Alert type="success" message="Password reset link has been sent to your email." />
  );
});

// GET - Show password reset confirmation form (when user clicks email link)
authRoutes.get("/reset-password/confirm", async (c) => {
  const code = c.req.query("code");
  const token = c.req.query("token");

  if (!code || !token) {
    return c.html(
      <ErrorPage errorMessage="Invalid or missing reset token" />
    );
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
      400
    );
  }

  if (password !== confirmPassword) {
    return c.html(
      <Alert type="danger" message="Passwords do not match" />,
      400
    );
  }

  if (password.length < 8) {
    return c.html(
      <Alert type="danger" message="Password must be at least 8 characters" />,
      400
    );
  }

  const supabase = createSupabaseClient(c);

  // Exchange the code for a session and update password
  const { error: exchangeError, data } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !data.session) {
    return c.html(
      <ErrorPage errorMessage={exchangeError?.message || "Invalid or expired reset link"} />
    );
  }

  // Update the password
  const { error: updateError } = await supabase.auth.updateUser({
    password: password,
  });

  if (updateError) {
    return c.html(
      <Alert type="danger" message={updateError.message} />,
      400
    );
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
