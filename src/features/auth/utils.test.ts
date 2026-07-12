import { describe, expect, it, vi } from "vitest";

vi.mock("../../lib/supabase", () => ({
  createSupabaseClient: vi.fn(),
}));

import {
  getCallbackErrorMessage,
  getPendingCreatorId,
  getPendingVerificationUrl,
} from "./utils";

describe("getCallbackErrorMessage", () => {
  it("maps expired OTP to signup guidance", () => {
    expect(getCallbackErrorMessage(undefined, "otp_expired")).toContain(
      "verification link has expired",
    );
  });

  it("maps expired OTP to recovery guidance", () => {
    expect(
      getCallbackErrorMessage(undefined, "otp_expired", undefined, "recovery"),
    ).toContain("password reset link has expired");
  });

  it("maps access denied to signup guidance", () => {
    expect(getCallbackErrorMessage("access_denied", "access_denied")).toContain(
      "invalid or has expired",
    );
  });

  it("decodes error descriptions", () => {
    expect(
      getCallbackErrorMessage("error", undefined, "Email+already+registered"),
    ).toBe("Email already registered");
  });

  it("returns default when no code is provided", () => {
    expect(getCallbackErrorMessage()).toContain("No authorization code provided");
  });
});

describe("pending signup metadata helpers", () => {
  it("reads creatorId and verificationUrl when present", () => {
    expect(
      getPendingCreatorId({
        creatorId: "creator-1",
        verificationUrl: "https://example.com",
      }),
    ).toBe("creator-1");
    expect(
      getPendingVerificationUrl({
        creatorId: "creator-1",
        verificationUrl: "https://example.com",
      }),
    ).toBe("https://example.com");
  });

  it("returns null for missing or invalid metadata", () => {
    expect(getPendingCreatorId({ creatorId: 1 })).toBeNull();
    expect(getPendingVerificationUrl(undefined)).toBeNull();
  });
});
