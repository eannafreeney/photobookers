import { describe, expect, it } from "vitest";
import {
  claimCompleteQuerySchema,
  claimFormSchema,
  registerAndClaimFormSchema,
} from "./schema";

const validUuid = "550e8400-e29b-41d4-a716-446655440000";

describe("claimFormSchema", () => {
  it("accepts empty or valid verification URLs", () => {
    expect(claimFormSchema.parse({ verificationUrl: "" })).toEqual({
      verificationUrl: "",
    });
    expect(
      claimFormSchema.parse({ verificationUrl: "https://example.com" }),
    ).toEqual({
      verificationUrl: "https://example.com",
    });
  });

  it("unwraps nested form.verificationUrl", () => {
    expect(
      claimFormSchema.parse({
        form: { verificationUrl: "https://example.com" },
      }),
    ).toEqual({ verificationUrl: "https://example.com" });
  });

  it("rejects invalid URLs", () => {
    expect(() =>
      claimFormSchema.parse({ verificationUrl: "not-a-url" }),
    ).toThrow();
  });
});

describe("registerAndClaimFormSchema", () => {
  it("accepts a valid signup-and-claim payload", () => {
    const parsed = registerAndClaimFormSchema.parse({
      firstName: "Jane",
      lastName: "Claimant",
      type: "fan",
      email: "jane@example.com",
      agreeToTerms: "on",
      verificationUrl: "https://example.com",
      captchaToken: "token",
    });
    expect(parsed.agreeToTerms).toBe(true);
  });

  it("unwraps nested form fields from multipart bodies", () => {
    const parsed = registerAndClaimFormSchema.parse({
      form: {
        firstName: "Jane",
        lastName: "Claimant",
        email: "jane@example.com",
        agreeToTerms: "on",
      },
      type: "fan",
      verificationUrl: "https://example.com",
      captchaToken: "token",
    });
    expect(parsed.firstName).toBe("Jane");
    expect(parsed.email).toBe("jane@example.com");
  });

  it("rejects missing captcha", () => {
    expect(() =>
      registerAndClaimFormSchema.parse({
        firstName: "Jane",
        lastName: "Claimant",
        type: "fan",
        email: "jane@example.com",
        agreeToTerms: "on",
        captchaToken: "",
      }),
    ).toThrow();
  });
});

describe("claimCompleteQuerySchema", () => {
  it("parses creatorId and verificationUrl", () => {
    const parsed = claimCompleteQuerySchema.parse({
      creatorId: validUuid,
      verificationUrl: "https://example.com",
    });
    expect(parsed.creatorId).toBe(validUuid);
  });
});
