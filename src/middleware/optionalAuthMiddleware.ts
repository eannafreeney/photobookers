import { Context, Next } from "hono";
import { deleteCookie, getCookie } from "hono/cookie";
import { refreshSessionAndSetCookies } from "./refreshAccessToken";
import { getUserFromToken } from "./getUserFromToken";
import { getCookieClearOptions } from "../lib/authCookies";
import { getAccessTokenFromRequest } from "../lib/getAccessTokenFromRequest";

export const optionalAuthMiddleware = async (c: Context, next: Next) => {
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

  let user = token ? await getUserFromToken(token) : null;

  // If token is invalid/expired but we have a refresh token, try to refresh
  if (!user && token && refreshToken) {
    const refreshed = await refreshSessionAndSetCookies(c, refreshToken);
    if (refreshed) {
      token = refreshed.access_token;
      refreshToken = refreshed.refresh_token;
      user = await getUserFromToken(refreshed.access_token);
    }
  }

  if (token && !user) {
    const clearOpts = getCookieClearOptions(c);
    deleteCookie(c, "token", clearOpts);
    deleteCookie(c, "refresh_token", clearOpts);
  }

  c.set("user", user);

  await next();
};
