import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { findUserByEmailAdmin } from "../../../features/dashboard/admin/creators/services.js";
import { supabaseAdmin } from "../../../lib/supabase.js";
import ValidateEmail from "../../../features/auth/components/ValidateEmail.js";
const POST = createRoute(async (c) => {
  const body = await c.req.parseBody();
  const email = body["email"];
  if (!email) return c.html(/* @__PURE__ */ jsx(ValidateEmail, {}));
  const normalizedEmail = email.trim().toLowerCase();
  let existsInAuth = false;
  try {
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1e3,
      page: 1
    });
    existsInAuth = authData?.users?.some(
      (u) => u.email?.toLowerCase() === normalizedEmail
    );
  } catch (error) {
    console.error("Failed to check if email exists in Supabase Auth:", error);
    return c.html(/* @__PURE__ */ jsx(ValidateEmail, {}));
  }
  const existingUser = await findUserByEmailAdmin(email);
  const isAvailable = !existsInAuth && !existingUser;
  return c.html(/* @__PURE__ */ jsx(ValidateEmail, { isAvailable }));
});
export {
  POST
};
