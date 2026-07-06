import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { refreshAccessToken } from "./refreshAccessToken.js";
import { getUserFromToken } from "./getUserFromToken.js";
import { getAuthCookieOptions } from "../features/auth/services.js";
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
    const refreshedToken = await refreshAccessToken(refreshToken, c);
    if (refreshedToken) {
      setCookie(c, "token", refreshedToken.access_token, {
        ...getAuthCookieOptions(c),
        maxAge: refreshedToken.expires_in
      });
      setCookie(c, "refresh_token", refreshedToken.refresh_token, {
        ...getAuthCookieOptions(c),
        maxAge: 60 * 60 * 24 * 7
        // 7 days
      });
      token = refreshedToken.access_token;
      refreshToken = refreshedToken.refresh_token;
    }
  }
  if (!token) {
    return redirectToLogin(c);
  }
  let user = await getUserFromToken(token);
  if (!user && refreshToken) {
    const refreshed = await refreshAccessToken(refreshToken, c);
    if (refreshed) {
      setCookie(c, "token", refreshed.access_token, {
        ...getAuthCookieOptions(c),
        maxAge: refreshed.expires_in
      });
      setCookie(c, "refresh_token", refreshed.refresh_token, {
        ...getAuthCookieOptions(c),
        maxAge: 60 * 60 * 24 * 7
        // 7 days
      });
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
