import { deleteCookie, getCookie } from "hono/cookie";
import { refreshSessionAndSetCookies } from "./refreshAccessToken.js";
import { getUserFromToken } from "./getUserFromToken.js";
import { getCookieClearOptions } from "../lib/authCookies.js";
import { getAccessTokenFromRequest } from "../lib/getAccessTokenFromRequest.js";
const LOGIN_PATH = "/auth/login";
function redirectToLogin(c) {
  const u = new URL(c.req.url);
  const path = u.pathname.endsWith("/") && u.pathname !== "/" ? u.pathname.replace(/\/$/, "") : u.pathname;
  if (path === LOGIN_PATH) {
    return c.redirect(LOGIN_PATH);
  }
  const returnTo = u.pathname + u.search;
  return c.redirect(
    `${LOGIN_PATH}?redirectUrl=${encodeURIComponent(returnTo)}`
  );
}
const requireAuth = async (c, next) => {
  let token = getAccessTokenFromRequest(c);
  let refreshToken = getCookie(c, "refresh_token");
  if (!token && refreshToken) {
    const refreshed = await refreshSessionAndSetCookies(c, refreshToken);
    if (refreshed) {
      token = refreshed.access_token;
      refreshToken = refreshed.refresh_token;
    }
  }
  if (!token) {
    return redirectToLogin(c);
  }
  let user = await getUserFromToken(token);
  if (!user && refreshToken) {
    const refreshed = await refreshSessionAndSetCookies(c, refreshToken);
    if (refreshed) {
      token = refreshed.access_token;
      refreshToken = refreshed.refresh_token;
      user = await getUserFromToken(refreshed.access_token);
    }
  }
  if (!user) {
    const clearOpts = getCookieClearOptions(c);
    deleteCookie(c, "token", clearOpts);
    deleteCookie(c, "refresh_token", clearOpts);
    return redirectToLogin(c);
  }
  c.set("user", user);
  if (user.mustResetPassword) {
    const path = new URL(c.req.url).pathname;
    if (path !== "/auth/force-reset-password" && path !== "/auth/reset-password") {
      const returnTo = new URL(c.req.url).pathname + new URL(c.req.url).search;
      return c.redirect(
        `/auth/force-reset-password?redirectUrl=${encodeURIComponent(returnTo)}`
      );
    }
  }
  await next();
};
export {
  requireAuth
};
