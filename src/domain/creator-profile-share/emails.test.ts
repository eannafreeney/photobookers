import { describe, expect, it } from "vitest";
import {
  buildCreatorProfileShareEmail,
  creatorProfileShareEmailSubject,
} from "./emails";

describe("creator profile share emails", () => {
  it("uses a share-focused subject", () => {
    expect(creatorProfileShareEmailSubject()).toBe(
      "Share your Photobookers profile",
    );
  });

  it("builds share kit html with profile url and caption", () => {
    const html = buildCreatorProfileShareEmail({
      displayName: "Jane Doe",
      slug: "jane-doe",
      type: "artist",
    });

    expect(html).toContain("Hi Jane Doe");
    expect(html).toContain("take a screenshot");
    expect(html).toContain("Share kit");
    expect(html).toContain("https://www.photobookers.com/creators/jane-doe");
    expect(html).toContain("Find my artist profile and books here:");
  });
});
