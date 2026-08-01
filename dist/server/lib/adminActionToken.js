import { createHmac, timingSafeEqual } from "node:crypto";
const TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1e3;
function getSecret() {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    throw new Error("AUTH_SECRET is required for admin action tokens");
  }
  return secret;
}
function signInstagramCancelToken(action) {
  const payload = JSON.stringify(action);
  const exp = Date.now() + TOKEN_TTL_MS;
  const body = Buffer.from(`${payload}:${exp}`).toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}
function verifyInstagramCancelToken(token) {
  const trimmed = token.trim();
  const dot = trimmed.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = trimmed.slice(0, dot);
  const sig = trimmed.slice(dot + 1);
  const expected = createHmac("sha256", getSecret()).update(body).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  let decoded;
  try {
    decoded = Buffer.from(body, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const colon = decoded.lastIndexOf(":");
  if (colon <= 0) return null;
  const payload = decoded.slice(0, colon);
  const exp = Number(decoded.slice(colon + 1));
  if (!Number.isFinite(exp) || Date.now() > exp) return null;
  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}
function buildInstagramCancelUrl(action) {
  const siteUrl = process.env.SITE_URL ?? "https://photobookers.com";
  const token = signInstagramCancelToken(action);
  return `${siteUrl}/jobs/instagram/cancel?token=${encodeURIComponent(token)}`;
}
export {
  buildInstagramCancelUrl,
  signInstagramCancelToken,
  verifyInstagramCancelToken
};
