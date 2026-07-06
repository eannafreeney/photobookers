import { jsx } from "hono/jsx/jsx-runtime";
import { hyperview } from "../../../lib/hxml.js";
import { getIsHyperview } from "../../../features/hyperview/lib.js";
import { getBaseUrl } from "../../../lib/hyperview.js";
import { getAuthCookieOptions } from "../../../features/auth/services.js";
import { deleteCookie } from "hono/cookie";
import { getAccessTokenFromRequest } from "../../../lib/getAccessTokenFromRequest.js";
import { supabaseAdmin } from "../../../lib/supabase.js";
import { createRoute } from "hono-fsr";
import FeaturedScreen from "../../../features/hyperview/components/FeaturedScreen.js";
async function clearSession(c) {
  const baseUrl = getBaseUrl(c);
  const cookieOpts = getAuthCookieOptions(c);
  const jwt = getAccessTokenFromRequest(c);
  const isHyperview = getIsHyperview(c);
  const hv = hyperview(c);
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
    if (error && error.code !== "bad_jwt") {
      console.error("Failed to revoke session:", error);
    }
  }
  if (isHyperview) {
    return hv(
      /* @__PURE__ */ jsx(
        FeaturedScreen,
        {
          baseUrl,
          user: null,
          clearClientSession: true
        }
      ),
      200
    );
  }
  return c.redirect(`${baseUrl}/hyperview/featured`, 303);
}
const GET = createRoute(async (c) => clearSession(c));
const POST = createRoute(async (c) => clearSession(c));
export {
  GET,
  POST
};
