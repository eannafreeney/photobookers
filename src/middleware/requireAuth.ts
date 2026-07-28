import { Context, Next } from "hono";
import { deleteCookie, getCookie } from "hono/cookie";
import { refreshSessionAndSetCookies } from "./refreshAccessToken";
import { getUserFromToken } from "./getUserFromToken";
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

  // If token is invalid/expired but we have a refresh token, try to refresh
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
