import { describe, expect, it } from "vitest";
import {
  getSubmittedClaimVerificationUrl,
  resolveClaimVerificationUrl,
  unwrapPrefixedForm,
} from "./verificationUrl";

describe("unwrapPrefixedForm", () => {
  it("flattens nested and dotted form fields", () => {
    expect(
      unwrapPrefixedForm({
        form: { verificationUrl: "https://example.com" },
        email: "jane@example.com",
      }),
    ).toMatchObject({
      verificationUrl: "https://example.com",
      email: "jane@example.com",
    });
    expect(
      unwrapPrefixedForm({
        "form.verificationUrl": "https://example.com",
      }),
    ).toMatchObject({ verificationUrl: "https://example.com" });
  });
});

describe("getSubmittedClaimVerificationUrl", () => {
  it("prefers nested form.verificationUrl", () => {
    expect(
      getSubmittedClaimVerificationUrl({
        form: { verificationUrl: "https://example.com" },
        verificationUrl: "https://other.com",
      }),
    ).toBe("https://example.com");
  });

  it("falls back to top-level verificationUrl", () => {
    expect(
      getSubmittedClaimVerificationUrl({
        verificationUrl: "https://example.com",
      }),
    ).toBe("https://example.com");
  });

  it("returns undefined for missing form data", () => {
    expect(getSubmittedClaimVerificationUrl(undefined)).toBeUndefined();
  });
});

describe("resolveClaimVerificationUrl", () => {
  it("falls back to listed website when nothing is submitted", () => {
    expect(
      resolveClaimVerificationUrl("https://example.com", undefined),
    ).toEqual({ ok: true, verificationUrl: "https://example.com" });
  });

  it("uses submitted URL when creator has no listed website", () => {
    expect(
      resolveClaimVerificationUrl(null, "https://example.com"),
    ).toEqual({ ok: true, verificationUrl: "https://example.com" });
  });

  it("accepts submitted URL that matches listed website", () => {
    expect(
      resolveClaimVerificationUrl(
        "https://example.com",
        "https://www.example.com/page",
      ),
    ).toEqual({ ok: true, verificationUrl: "https://www.example.com/page" });
  });

  it("rejects submitted URL on a different domain", () => {
    expect(
      resolveClaimVerificationUrl("https://example.com", "https://other.com"),
    ).toEqual({
      ok: false,
      message:
        "The URL must match the creator's listed website (https://example.com).",
    });
  });
});
