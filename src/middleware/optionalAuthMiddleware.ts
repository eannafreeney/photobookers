import { Context, Next } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { refreshAccessToken } from "./refreshAccessToken";
import { getUserFromToken } from "./getUserFromToken";
import { checkIncompleteCreatorSignup } from "./auth";

export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  let token = getCookie(c, "token");
  let refreshToken = getCookie(c, "refresh_token");

  // If no token but we have a refresh token, try to refresh
  if (!token && refreshToken) {
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
    }
  }

  let user = token ? await getUserFromToken(token) : null;

  // If token is invalid/expired but we have a refresh token, try to refresh
  if (!user && token && refreshToken) {
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

  if (token && !user) {
    deleteCookie(c, "token");
    deleteCookie(c, "refresh_token");
  }

  c.set("user", user);

  const path = c.req.path;

  // Only check for incomplete signup if NOT already on the creator form page or auth pages
  if (
    !path.startsWith("/dashboard/creators/new") &&
    !path.startsWith("/auth/") &&
    !path.startsWith("/api/") &&
    user
  ) {
    const redirect = await checkIncompleteCreatorSignup(c, user);
    if (redirect) return redirect;
  }

  await next();
};
