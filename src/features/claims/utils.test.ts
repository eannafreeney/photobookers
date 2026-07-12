import { describe, expect, it, vi } from "vitest";

vi.mock("../../lib/sendEmail", () => ({
  sendEmail: vi.fn(),
}));

import { emailMatchesWebsite } from "./utils";

describe("emailMatchesWebsite", () => {
  it("matches when email domain equals website host", () => {
    expect(emailMatchesWebsite("jane@example.com", "https://example.com")).toBe(
      true,
    );
  });

  it("is case insensitive", () => {
    expect(emailMatchesWebsite("JANE@EXAMPLE.COM", "https://WWW.Example.com")).toBe(
      true,
    );
  });

  it("rejects subdomain mismatch", () => {
    expect(
      emailMatchesWebsite("jane@gmail.com", "https://example.com"),
    ).toBe(false);
  });

  it("rejects when email has no domain", () => {
    expect(emailMatchesWebsite("invalid", "https://example.com")).toBe(false);
  });
});
