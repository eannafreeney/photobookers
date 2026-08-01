import { isSameDomain, normalizeUrl } from "../../services/verification.js";
function unwrapPrefixedForm(body, prefix = "form") {
  if (!body || typeof body !== "object") return {};
  const record = body;
  const nested = record[prefix];
  const flattened = { ...record };
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    Object.assign(flattened, nested);
  }
  const prefixDot = `${prefix}.`;
  for (const [key, value] of Object.entries(record)) {
    if (key.startsWith(prefixDot)) {
      flattened[key.slice(prefixDot.length)] = value;
    }
  }
  return flattened;
}
function getSubmittedClaimVerificationUrl(formData) {
  if (!formData) return void 0;
  const flattened = unwrapPrefixedForm(formData);
  const topLevel = flattened.verificationUrl;
  return typeof topLevel === "string" && topLevel.trim() ? topLevel.trim() : void 0;
}
function resolveClaimVerificationUrl(creatorWebsite, submittedUrl) {
  if (creatorWebsite && submittedUrl && !isSameDomain(submittedUrl, creatorWebsite)) {
    return {
      ok: false,
      message: `The URL must match the creator's listed website (${creatorWebsite}).`
    };
  }
  const rawUrl = submittedUrl ?? creatorWebsite ?? null;
  const verificationUrl = rawUrl ? normalizeUrl(rawUrl) : null;
  return { ok: true, verificationUrl };
}
export {
  getSubmittedClaimVerificationUrl,
  resolveClaimVerificationUrl,
  unwrapPrefixedForm
};
