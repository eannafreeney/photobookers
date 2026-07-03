import { describe, expect, it } from "vitest";
import {
  buildCreatorPostNotificationHtml,
  truncatePostBody,
} from "./emails";

describe("truncatePostBody", () => {
  it("returns short bodies unchanged", () => {
    expect(truncatePostBody("Hello followers")).toBe("Hello followers");
  });

  it("truncates long bodies with an ellipsis", () => {
    const long = "a".repeat(250);
    expect(truncatePostBody(long, 200)).toBe(`${"a".repeat(200)}…`);
  });
});

describe("buildCreatorPostNotificationHtml", () => {
  it("includes creator name, preview, and profile link", () => {
    const html = buildCreatorPostNotificationHtml(
      "Jane Doe",
      "jane-doe",
      "Opening my studio this weekend.",
      null,
    );

    expect(html).toContain("New post from Jane Doe");
    expect(html).toContain("Opening my studio this weekend.");
    expect(html).toContain("/creators/jane-doe");
  });
});
