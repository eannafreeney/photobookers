import { isSameDomain, normalizeUrl } from "../../services/verification";

export type ClaimFormVerificationInput = {
  verificationUrl?: string;
  form?: {
    verificationUrl?: string;
  };
} & Record<string, unknown>;

export function unwrapPrefixedForm(
  body: unknown,
  prefix = "form",
): Record<string, unknown> {
  if (!body || typeof body !== "object") return {};

  const record = body as Record<string, unknown>;
  const nested = record[prefix];
  const flattened: Record<string, unknown> = { ...record };

  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    Object.assign(flattened, nested as Record<string, unknown>);
  }

  const prefixDot = `${prefix}.`;
  for (const [key, value] of Object.entries(record)) {
    if (key.startsWith(prefixDot)) {
      flattened[key.slice(prefixDot.length)] = value;
    }
  }

  return flattened;
}

export function getSubmittedClaimVerificationUrl(
  formData?: ClaimFormVerificationInput | null,
): string | undefined {
  if (!formData) return undefined;

  const flattened = unwrapPrefixedForm(formData);
  const topLevel = flattened.verificationUrl;
  return typeof topLevel === "string" && topLevel.trim()
    ? topLevel.trim()
    : undefined;
}

export type ResolveClaimVerificationUrlResult =
  | { ok: true; verificationUrl: string | null }
  | { ok: false; message: string };

export function resolveClaimVerificationUrl(
  creatorWebsite: string | null | undefined,
  submittedUrl: string | undefined,
): ResolveClaimVerificationUrlResult {
  if (
    creatorWebsite &&
    submittedUrl &&
    !isSameDomain(submittedUrl, creatorWebsite)
  ) {
    return {
      ok: false,
      message: `The URL must match the creator's listed website (${creatorWebsite}).`,
    };
  }

  const rawUrl = submittedUrl ?? creatorWebsite ?? null;
  const verificationUrl = rawUrl ? normalizeUrl(rawUrl) : null;

  return { ok: true, verificationUrl };
}
