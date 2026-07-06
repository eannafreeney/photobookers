import { createRoute } from "hono-fsr";
import { supabaseAdmin } from "../../lib/supabase.js";
import { db } from "../../db/client.js";
import { users } from "../../db/schema.js";
import { sql } from "drizzle-orm";
import { setCookiesAndVerifyUser } from "../../features/auth/services.js";
const POST = createRoute(async (c) => {
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid body" }, 400);
  }
  const access_token = body.access_token;
  const refresh_token = body.refresh_token ?? "";
  const expires_in = typeof body.expires_in === "number" ? body.expires_in : 3600;
  if (!access_token || typeof access_token !== "string") {
    return c.json({ error: "Missing access_token" }, 400);
  }
  const {
    data: { user },
    error
  } = await supabaseAdmin.auth.getUser(access_token);
  if (error || !user) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
  const firstName = user.user_metadata?.firstName ?? null;
  const lastName = user.user_metadata?.lastName ?? null;
  try {
    await db.insert(users).values({
      id: user.id,
      email: user.email,
      firstName,
      lastName,
      createdAt: /* @__PURE__ */ new Date()
    }).onConflictDoUpdate({
      target: users.id,
      set: {
        firstName,
        lastName,
        createdAt: sql`COALESCE(${users.createdAt}, now())`,
        updatedAt: /* @__PURE__ */ new Date()
      }
    });
  } catch (dbError) {
    console.error("Database error during set-session:", dbError);
    return c.json(
      { error: "Failed to create account. Please try again." },
      500
    );
  }
  await setCookiesAndVerifyUser(c, {
    access_token,
    refresh_token,
    expires_in,
    user,
    token_type: "bearer"
  });
  return c.json({ ok: true });
});
export {
  POST
};
