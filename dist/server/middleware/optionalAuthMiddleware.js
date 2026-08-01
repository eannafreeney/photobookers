import { deleteCookie, getCookie } from "hono/cookie";
import { refreshSessionAndSetCookies } from "./refreshAccessToken.js";
import { getUserFromToken } from "./getUserFromToken.js";
import { getCookieClearOptions } from "../lib/authCookies.js";
import { getAccessTokenFromRequest } from "../lib/getAccessTokenFromRequest.js";
const optionalAuthMiddleware = async (c, next) => {
  let token = getAccessTokenFromRequest(c);
  let refreshToken = getCookie(c, "refresh_token");
  if (!token && refreshToken) {
    const refreshed = await refreshSessionAndSetCookies(c, refreshToken);
    if (refreshed) {
      token = refreshed.access_token;
      refreshToken = refreshed.refresh_token;
    }
  }
  let user = token ? await getUserFromToken(token) : null;
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
export {
  optionalAuthMiddleware
};
