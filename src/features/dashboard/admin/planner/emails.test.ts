import { describe, expect, it } from "vitest";
import { generateBOTDNotificationEmail } from "./emails";

describe("generateBOTDNotificationEmail", () => {
  it("includes the BOTD calendar date in the body", () => {
    const html = generateBOTDNotificationEmail(
      {
        displayName: "Jane Doe",
        email: "jane@example.com",
        slug: "jane-doe",
        ownerUserId: "user-1",
      },
      { id: "book-1", title: "Winter Light", slug: "winter-light" },
      new Date(Date.UTC(2026, 5, 1)),
    );

    expect(html).toContain("Monday, June 1, 2026");
    expect(html).toContain("Winter Light");
    expect(html).not.toContain("Claim your profile");
  });
});
