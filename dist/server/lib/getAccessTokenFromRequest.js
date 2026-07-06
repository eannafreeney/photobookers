import { getCookie } from "hono/cookie";
function getAccessTokenFromRequest(c) {
  const accessToken = getCookie(c, "token");
  if (accessToken) return accessToken;
  const auth = c.req.header("Authorization");
  if (!auth) return void 0;
  const match = /^Bearer\s+(\S+)$/i.exec(auth.trim());
  return match?.[1];
}
export {
  getAccessTokenFromRequest
};
