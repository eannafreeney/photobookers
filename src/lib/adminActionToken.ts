import { createHmac, timingSafeEqual } from "node:crypto";
import type { TrendingInstagramPostKind } from "../features/dashboard/admin/planner/newsletter/types";

const TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export type InstagramCancelAction =
  | { type: "trending"; campaignId: string; kind: TrendingInstagramPostKind }
  | { type: "verified-creator"; creatorId: string };

function getSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    throw new Error("AUTH_SECRET is required for admin action tokens");
  }
  return secret;
}

export function signInstagramCancelToken(action: InstagramCancelAction): string {
  const payload = JSON.stringify(action);
  const exp = Date.now() + TOKEN_TTL_MS;
  const body = Buffer.from(`${payload}:${exp}`).toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyInstagramCancelToken(
  token: string,
): InstagramCancelAction | null {
  const trimmed = token.trim();
  const dot = trimmed.lastIndexOf(".");
  if (dot <= 0) return null;

  const body = trimmed.slice(0, dot);
  const sig = trimmed.slice(dot + 1);
  const expected = createHmac("sha256", getSecret())
    .update(body)
    .digest("base64url");

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (
    sigBuf.length !== expectedBuf.length ||
    !timingSafeEqual(sigBuf, expectedBuf)
  ) {
    return null;
  }

  let decoded: string;
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
    return JSON.parse(payload) as InstagramCancelAction;
  } catch {
    return null;
  }
}

export function buildInstagramCancelUrl(action: InstagramCancelAction): string {
  const siteUrl = process.env.SITE_URL ?? "https://photobookers.com";
  const token = signInstagramCancelToken(action);
  return `${siteUrl}/jobs/instagram/cancel?token=${encodeURIComponent(token)}`;
}
