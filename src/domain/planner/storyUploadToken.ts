import { createHmac, timingSafeEqual } from "node:crypto";
import { err, ok, type Result } from "../../lib/result";

type Payload = {
  kind: "botd" | "aotw" | "potw";
  id: string;
  exp: number;
};

function getSecret(): string {
  return process.env.STORY_UPLOAD_SECRET ?? process.env.SESSION_SECRET ?? "photobookers-story-upload";
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createStoryUploadToken(
  kind: Payload["kind"],
  id: string,
  ttlMs = 14 * 24 * 60 * 60 * 1000,
): string {
  const payload: Payload = { kind, id, exp: Date.now() + ttlMs };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyStoryUploadToken(
  token: string,
): Result<Payload, { reason: string }> {
  const [body, signature] = token.split(".");
  if (!body || !signature) return err({ reason: "Invalid token" });

  const expected = sign(body);
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return err({ reason: "Invalid token" });
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as Payload;
    if (payload.exp < Date.now()) return err({ reason: "Token expired" });
    if (!["botd", "aotw", "potw"].includes(payload.kind)) {
      return err({ reason: "Invalid token" });
    }
    return ok(payload);
  } catch {
    return err({ reason: "Invalid token" });
  }
}
