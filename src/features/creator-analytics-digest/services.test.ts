import { describe, expect, it } from "vitest";
import { resolveCreatorRecipientEmail } from "./recipients";

describe("resolveCreatorRecipientEmail", () => {
  it("prefers owner email", () => {
    expect(
      resolveCreatorRecipientEmail({
        email: "creator@example.com",
        ownerEmail: "owner@example.com",
      }),
    ).toBe("owner@example.com");
  });

  it("falls back to creator email", () => {
    expect(
      resolveCreatorRecipientEmail({
        email: "creator@example.com",
        ownerEmail: null,
      }),
    ).toBe("creator@example.com");
  });

  it("returns null when no email is available", () => {
    expect(
      resolveCreatorRecipientEmail({ email: null, ownerEmail: null }),
    ).toBeNull();
  });
});
