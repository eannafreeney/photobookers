import { Context, Next } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { refreshAccessToken } from "./refreshAccessToken";
import { getUserFromToken } from "./getUserFromToken";
import { getAuthCookieOptions } from "../features/auth/services";
import { getCookieClearOptions } from "../lib/authCookies";
import { getAccessTokenFromRequest } from "../lib/getAccessTokenFromRequest";

const LOGIN_PATH = "/auth/login";
function redirectToLogin(c: Context) {
  const u = new URL(c.req.url);
  const path =
    u.pathname.endsWith("/") && u.pathname !== "/"
      ? u.pathname.replace(/\/$/, "")
      : u.pathname;
  if (path === LOGIN_PATH) {
    return c.redirect(LOGIN_PATH);
  }
  const returnTo = u.pathname + u.search;
  return c.redirect(
    `${LOGIN_PATH}?redirectUrl=${encodeURIComponent(returnTo)}`,
  );
}

export const requireAuth = async (c: Context, next: Next) => {
  let token = getAccessTokenFromRequest(c);
  let refreshToken = getCookie(c, "refresh_token");

  // If no token but we have a refresh token, try to refresh
  if (!token && refreshToken) {
    const refreshedToken = await refreshAccessToken(refreshToken, c);
    if (refreshedToken) {
      setCookie(c, "token", refreshedToken.access_token, {
        ...getAuthCookieOptions(c),
        maxAge: refreshedToken.expires_in,
      });
      setCookie(c, "refresh_token", refreshedToken.refresh_token, {
        ...getAuthCookieOptions(c),
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      token = refreshedToken.access_token;
      refreshToken = refreshedToken.refresh_token;
    }
  }

  if (!token) {
    return redirectToLogin(c);
  }

  let user = await getUserFromToken(token);

  // If token is invalid/expired but we have a refresh token, try to refresh
  if (!user && refreshToken) {
    const refreshed = await refreshAccessToken(refreshToken, c);
    if (refreshed) {
      setCookie(c, "token", refreshed.access_token, {
        ...getAuthCookieOptions(c),
        maxAge: refreshed.expires_in,
      });
      setCookie(c, "refresh_token", refreshed.refresh_token, {
        ...getAuthCookieOptions(c),
        maxAge: 60 * 60 * 24 * 7, // 7 days
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

  // Attach user to context
  c.set("user", user);

  if (user.mustResetPassword) {
    const path = new URL(c.req.url).pathname;
    if (
      path !== "/auth/force-reset-password" &&
      path !== "/auth/reset-password"
    ) {
      const returnTo = new URL(c.req.url).pathname + new URL(c.req.url).search;
      return c.redirect(
        `/auth/force-reset-password?redirectUrl=${encodeURIComponent(returnTo)}`,
      );
    }
  }

  await next();
};
