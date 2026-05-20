import { hyperview } from "../../../lib/hxml";
import { getIsHyperview } from "../../../features/hyperview/lib";
import { hyperviewSignOutAndNavigate } from "../../../features/hyperview/sessionSync";
import { getBaseUrl } from "../../../lib/hyperview";
import { getAuthCookieOptions } from "../../../features/auth/services";
import { deleteCookie, getCookie } from "hono/cookie";
import { supabaseAdmin } from "../../../lib/supabase";
import { createRoute } from "hono-fsr";
import type { Context } from "hono";

async function clearSession(c: Context) {
  const baseUrl = getBaseUrl(c);
  const cookieOpts = getAuthCookieOptions();
  const jwt = getCookie(c, "token");

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
  }

  if (getIsHyperview(c)) {
    return hyperview(c)(hyperviewSignOutAndNavigate(baseUrl), 200);
  }

  return c.redirect(`${baseUrl}/hyperview/featured`, 303);
}

export const GET = createRoute(async (c) => clearSession(c));
export const POST = createRoute(async (c) => clearSession(c));
