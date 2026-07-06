import { describe, expect, it } from "vitest";
import { generateWelcomeEmail } from "../dashboard/admin/creators/emails";
import { stubClaimStartUrl } from "./urls";

describe("stubClaimStartUrl", () => {
  it("builds the claim start path for a creator", () => {
    expect(stubClaimStartUrl("abc-123")).toMatch(/\/claims\/abc-123\/start$/);
  });
});

describe("generateWelcomeEmail", () => {
  it("uses a claim link instead of a pre-provisioned login", () => {
    const claimLink = "https://photobookers.com/claims/abc-123/start";
    const html = generateWelcomeEmail(
      {
        id: "abc-123",
        slug: "jane-doe",
        displayName: "Jane Doe",
      } as Parameters<typeof generateWelcomeEmail>[0],
      claimLink,
    );

    expect(html).toContain(claimLink);
    expect(html).toContain("Claim your profile");
    expect(html).not.toContain("Log in to your account");
    expect(html).not.toContain("/auth/login");
  });
});
