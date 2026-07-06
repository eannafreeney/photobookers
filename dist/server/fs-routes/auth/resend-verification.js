import { createRoute } from "hono-fsr";
import { showErrorAlert, showSuccessAlert } from "../../lib/alertHelpers.js";
import { supabaseAdmin } from "../../lib/supabase.js";
import { getUser } from "../../utils.js";
const POST = createRoute(async (c) => {
  const user = await getUser(c);
  if (!user) return showErrorAlert(c, "Please log in first.", 401);
  const baseUrl = process.env.SITE_URL ?? "http://localhost:5173";
  const emailRedirectTo = `${baseUrl.replace(/\/$/, "")}/auth/callback`;
  const { error } = await supabaseAdmin.auth.resend({
    type: "signup",
    email: user.email,
    options: { emailRedirectTo }
  });
  if (error) return showErrorAlert(c, error.message);
  return showSuccessAlert(c, "Verification email sent.");
});
export {
  POST
};
