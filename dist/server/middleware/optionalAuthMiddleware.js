import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { refreshAccessToken } from "./refreshAccessToken.js";
import { getUserFromToken } from "./getUserFromToken.js";
import { getAuthCookieOptions } from "../features/auth/services.js";
import { getCookieClearOptions } from "../lib/authCookies.js";
import { getAccessTokenFromRequest } from "../lib/getAccessTokenFromRequest.js";
const optionalAuthMiddleware = async (c, next) => {
  let token = getAccessTokenFromRequest(c);
  let refreshToken = getCookie(c, "refresh_token");
  if (!token && refreshToken) {
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
    }
  }
  let user = token ? await getUserFromToken(token) : null;
  if (!user && token && refreshToken) {
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
