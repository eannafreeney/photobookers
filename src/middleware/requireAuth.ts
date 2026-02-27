import { Context, Next } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { refreshAccessToken } from "./refreshAccessToken";
import { getUserFromToken } from "./getUserFromToken";
import { checkIncompleteCreatorSignup } from "./auth";
import { getAuthCookieOptions } from "../features/auth/services";

export const requireAuth = async (c: Context, next: Next) => {
  let token = getCookie(c, "token");
  let refreshToken = getCookie(c, "refresh_token");

  // If no token but we have a refresh token, try to refresh
  if (!token && refreshToken) {
    const refreshedToken = await refreshAccessToken(refreshToken, c);
    if (refreshedToken) {
      setCookie(c, "token", refreshedToken.access_token, {
        ...getAuthCookieOptions(),
        maxAge: refreshedToken.expires_in,
      });
      setCookie(c, "refresh_token", refreshedToken.refresh_token, {
        ...getAuthCookieOptions(),
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      token = refreshedToken.access_token;
      refreshToken = refreshedToken.refresh_token;
    }
  }

  if (!token) {
    return c.redirect("/auth/login");
  }

  let user = await getUserFromToken(token);

  // If token is invalid/expired but we have a refresh token, try to refresh
  if (!user && refreshToken) {
    const refreshed = await refreshAccessToken(refreshToken, c);
    if (refreshed) {
      setCookie(c, "token", refreshed.access_token, {
        httpOnly: true,
        maxAge: refreshed.expires_in,
        path: "/",
      });
      setCookie(c, "refresh_token", refreshed.refresh_token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
      token = refreshed.access_token;
      refreshToken = refreshed.refresh_token;
      user = await getUserFromToken(refreshed.access_token);
    }
  }

  if (!user) {
    // Clear invalid cookies
    deleteCookie(c, "token");
    deleteCookie(c, "refresh_token");
    return c.redirect("/auth/login");
  }

  // Attach user to context
  c.set("user", user);

  // Check for incomplete creator signup (but allow dashboard routes to handle their own redirects)
  const path = c.req.path;
  if (
    !path.startsWith("/dashboard/creators/new") &&
    !path.startsWith("/auth/") &&
    !path.startsWith("/api/")
  ) {
    const redirect = await checkIncompleteCreatorSignup(c, user);
    if (redirect) return redirect;
  }

  await next();
};
