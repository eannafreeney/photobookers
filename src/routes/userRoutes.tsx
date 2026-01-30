import { Hono } from "hono";
import { supabaseAdmin } from "../lib/supabase";
import Alert from "../components/app/Alert";
import { db } from "../db/client";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import EditAccountPage from "../pages/EditAccountPage";
import { getUser } from "../utils";

export const userRoutes = new Hono();

userRoutes.post("/reset-password", async (c) => {
  const body = await c.req.parseBody();
  const email = body.email as string;

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email: email,
  });

  if (error) {
    return c.html(<Alert type="danger" message={error.message} />, 422);
  }

  return c.html(<Alert type="success" message="Password reset email sent" />);
});

// Get current user
userRoutes.get("/my-account", async (c) => {
  const user = await getUser(c);
  if (!user) {
    return c.redirect("/auth/login");
  }

  return c.html(<EditAccountPage user={user} />);
});
