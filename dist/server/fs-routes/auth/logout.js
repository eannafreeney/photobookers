import { createRoute } from "hono-fsr";
import { getAuthCookieOptions } from "../../features/auth/services.js";
import { deleteCookie, getCookie } from "hono/cookie";
import { getUser } from "../../utils.js";
import { supabaseAdmin } from "../../lib/supabase.js";
import { showErrorAlert } from "../../lib/alertHelpers.js";
const POST = createRoute(async (c) => {
  const user = await getUser(c);
  const jwt = getCookie(c, "token");
  if (!user) return c.redirect("/auth/login");
  const cookieOpts = getAuthCookieOptions(c);
  deleteCookie(c, "token", {
    path: cookieOpts.path,
    domain: cookieOpts.domain
  });
  deleteCookie(c, "refresh_token", {
    path: cookieOpts.path,
    domain: cookieOpts.domain
  });
  if (jwt) {
    const { error } = await supabaseAdmin.auth.admin.signOut(jwt);
    if (error) console.error("Failed to revoke session:", error);
    if (error) return showErrorAlert(c);
  }
  return c.redirect("/");
});
export {
  POST
};
