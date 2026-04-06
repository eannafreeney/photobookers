import { createRoute } from "hono-fsr";
import { findUserByEmailAdmin } from "../../../features/dashboard/admin/creators/services";
import { supabaseAdmin } from "../../../lib/supabase";
import ValidateEmail from "../../../features/auth/components/ValidateEmail";
import { Context } from "hono";

export const POST = createRoute(async (c: Context) => {
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
});
