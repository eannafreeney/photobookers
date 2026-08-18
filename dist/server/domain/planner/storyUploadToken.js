import { createHmac, timingSafeEqual } from "node:crypto";
import { err, ok } from "../../lib/result.js";
function getSecret() {
  return process.env.STORY_UPLOAD_SECRET ?? process.env.SESSION_SECRET ?? "photobookers-story-upload";
}
function sign(payload) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}
function createStoryUploadToken(kind, id, ttlMs = 14 * 24 * 60 * 60 * 1e3) {
  const payload = { kind, id, exp: Date.now() + ttlMs };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}
function verifyStoryUploadToken(token) {
  const [body, signature] = token.split(".");
  if (!body || !signature) return err({ reason: "Invalid token" });
  const expected = sign(body);
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return err({ reason: "Invalid token" });
  }
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    );
    if (payload.exp < Date.now()) return err({ reason: "Token expired" });
    if (!["botd", "aotw", "potw"].includes(payload.kind)) {
      return err({ reason: "Invalid token" });
    }
    return ok(payload);
  } catch {
    return err({ reason: "Invalid token" });
  }
}
export {
  createStoryUploadToken,
  verifyStoryUploadToken
};
