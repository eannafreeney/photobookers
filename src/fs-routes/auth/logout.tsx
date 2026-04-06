import { createRoute } from "hono-fsr";
import { getAuthCookieOptions } from "../../features/auth/services";
import { deleteCookie, getCookie } from "hono/cookie";
import { Context } from "hono";
import { getUser } from "../../utils";
import { supabaseAdmin } from "../../lib/supabase";
import { showErrorAlert } from "../../lib/alertHelpers";

export const POST = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const jwt = getCookie(c, "token");
  if (!user) return c.redirect("/auth/login");

  const cookieOpts = getAuthCookieOptions();
  deleteCookie(c, "token", {
    path: cookieOpts.path,
    domain: cookieOpts.domain,
  });
  deleteCookie(c, "refresh_token", {
    path: cookieOpts.path,
    domain: cookieOpts.domain,
  });

  if (jwt) {
    const { error } = await supabaseAdmin.auth.admin.signOut(jwt);
    if (error) console.error("Failed to revoke session:", error);
    if (error) return showErrorAlert(c);
  }

  return c.redirect("/");
});
