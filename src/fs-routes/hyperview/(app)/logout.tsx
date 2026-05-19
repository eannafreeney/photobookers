import { createRoute } from "hono-fsr";
import type { Context } from "hono";
import { deleteCookie, getCookie } from "hono/cookie";
import { getAuthCookieOptions } from "../../../features/auth/services";
import { getBaseUrl } from "../../../lib/hyperview";
import { supabaseAdmin } from "../../../lib/supabase";

/**
 * Clears auth cookies and revokes the Supabase session (aligned with POST /auth/logout).
 * Featured header uses GET push → this route must handle GET.
 */
async function clearSessionAndRedirect(c: Context) {
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

  return c.redirect(`${baseUrl}/hyperview/featured`, 303);
}

export const GET = createRoute(async (c: Context) =>
  clearSessionAndRedirect(c),
);

export const POST = createRoute(async (c: Context) =>
  clearSessionAndRedirect(c),
);
