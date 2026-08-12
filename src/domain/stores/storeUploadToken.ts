import { createHmac, timingSafeEqual } from "node:crypto";
import { err, ok, type Result } from "../../lib/result";

type Payload = {
  storeId: string;
  exp: number;
};

function getSecret(): string {
  return (
    process.env.STORE_UPLOAD_SECRET ??
    process.env.SESSION_SECRET ??
    "photobookers-store-upload"
  );
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

/** Default: 60 days — enough runway for spreadsheet outreach batches. */
export function createStoreUploadToken(
  storeId: string,
  ttlMs = 60 * 24 * 60 * 60 * 1000,
): string {
  const payload: Payload = { storeId, exp: Date.now() + ttlMs };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyStoreUploadToken(
  token: string,
): Result<Payload, { reason: string }> {
  const [body, signature] = token.split(".");
  if (!body || !signature) return err({ reason: "Invalid token" });

  const expected = sign(body);
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return err({ reason: "Invalid token" });
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as Payload;
    if (!payload.storeId || typeof payload.storeId !== "string") {
      return err({ reason: "Invalid token" });
    }
    if (payload.exp < Date.now()) return err({ reason: "Token expired" });
    return ok(payload);
  } catch {
    return err({ reason: "Invalid token" });
  }
}
