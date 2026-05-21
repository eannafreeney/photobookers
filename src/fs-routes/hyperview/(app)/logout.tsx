import { hyperview } from "../../../lib/hxml";
import { getIsHyperview } from "../../../features/hyperview/lib";
import { getBaseUrl } from "../../../lib/hyperview";
import { getAuthCookieOptions } from "../../../features/auth/services";
import { deleteCookie } from "hono/cookie";
import { getAccessTokenFromRequest } from "../../../lib/getAccessTokenFromRequest";
import { supabaseAdmin } from "../../../lib/supabase";
import { createRoute } from "hono-fsr";
import type { Context } from "hono";
import { AppLayout } from "../+layout";
import { Behavior } from "../../../lib/hxml-comps";

async function clearSession(c: Context) {
  const baseUrl = getBaseUrl(c);
  const cookieOpts = getAuthCookieOptions();
  const jwt = getAccessTokenFromRequest(c);
  const hv = hyperview(c);

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
    if (error && error.code !== "bad_jwt") {
      console.error("Failed to revoke session:", error);
    }
  }

  if (getIsHyperview(c)) {
    const featured = `${baseUrl}/hyperview/featured`;
    return hv(
      <AppLayout
        title="Home"
        showBackButton={false}
        baseUrl={baseUrl}
        showDock
        dockActive="home"
      >
        <Behavior trigger="load" action="sign-out-supabase" />
        <Behavior trigger="load" action="navigate" href={featured} />
      </AppLayout>,
      200,
    );
  }

  return c.redirect(`${baseUrl}/hyperview/featured`, 303);
}

export const GET = createRoute(async (c) => clearSession(c));
export const POST = createRoute(async (c) => clearSession(c));
