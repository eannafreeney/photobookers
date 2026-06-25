import { describe, expect, it } from "vitest";
import {
  generateLoginInstructionsEmail,
  loginInstructionsEmailSubject,
} from "./emails";

describe("login instructions email", () => {
  it("builds account-created email with set-password link", () => {
    const html = generateLoginInstructionsEmail({
      firstName: "Alex",
      creatorDisplayName: "Studio One",
      setPasswordLink: "https://photobookers.com/auth/update-password#token",
      purpose: "account_created",
    });

    expect(loginInstructionsEmailSubject("account_created")).toBe(
      "Your Photobookers account is ready",
    );
    expect(html).toContain("Hi Alex");
    expect(html).toContain("Studio One");
    expect(html).toContain("https://photobookers.com/auth/update-password#token");
  });

  it("builds password-reset email", () => {
    const html = generateLoginInstructionsEmail({
      setPasswordLink: "https://photobookers.com/reset",
      purpose: "password_reset",
    });

    expect(loginInstructionsEmailSubject("password_reset")).toBe(
      "Reset your Photobookers password",
    );
    expect(html).toContain("reset by an administrator");
    expect(html).not.toContain("linked to the creator profile");
  });
});
