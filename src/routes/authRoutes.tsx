import { Hono } from "hono";
import { createSupabaseClient, supabaseAdmin } from "../lib/supabase";
import { db } from "../db/client";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { deleteCookie, setCookie } from "hono/cookie";
import RegisterPage from "../pages/auth/RegisterPage";
import { login } from "../middleware/auth";
import LoginPage from "../pages/auth/LoginPage";
import { getUser, setFlash } from "../utils";
import AccountsPage from "../pages/auth/AccountsPage";
import Modal from "../components/app/Modal";
import Alert from "../components/app/Alert";
import Page from "../components/layouts/Page";
import AppLayout from "../components/layouts/AppLayout";
import Button from "../components/app/Button";
import Link from "../components/app/Link";

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
  const firstName = body.firstName as string;
  const lastName = body.lastName as string;
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
        firstName,
        lastName,
      },
    },
  });

  if (error) {
    return c.html(<Alert type="danger" message={error.message} />, 401);
  }

  console.log("data", data);

  await setFlash(
    c,
    "success",
    `Hi ${
      data.user?.user_metadata?.firstName ?? "there"
    }! Your account has been created successfully. Check your email for verification.`
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

  console.log("data", data);

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

  // Check if user already exists in database
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
      <ErrorPage errorMessage="Failed to create account. Please try again." />
    );
  }

  const validTypes = ["artist", "fan", "publisher"] as const;
  const type = c.req.query("type");
  const safeType = validTypes.includes(type as (typeof validTypes)[number])
    ? type
    : "fan";
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
  };

  return c.redirect(redirectMap[safeType ?? "fan"] ?? "/");
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

// Get current user
authRoutes.get("/my-account", async (c) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return c.json({ error: "No token provided" }, 401);
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return c.json({ error: "Invalid token" }, 401);
  }

  // Get full user data from your table
  const [dbUser] = await db.select().from(users).where(eq(users.id, user.id));

  return c.json({ user: dbUser });
});

export { authRoutes };
