import { describe, expect, it } from "vitest";
import { buildFeedbackRequestEmail } from "./emails";
import {
  getVerificationFeedbackEligibleBefore,
  VERIFICATION_FEEDBACK_DELAY_DAYS,
} from "./utils";

describe("verification feedback emails", () => {
  it("builds fan feedback with neutral intro", () => {
    const html = buildFeedbackRequestEmail({
      name: "Alex",
      kind: "fan",
    });

    expect(html).toContain("Hi Alex");
    expect(html).toContain("You joined Photobookers about a week ago");
    expect(html).toContain("Reply to this email");
    expect(html).not.toContain("creator profile");
  });

  it("builds creator feedback with creator intro", () => {
    const html = buildFeedbackRequestEmail({
      name: "Jane Doe",
      kind: "creator",
    });

    expect(html).toContain("Jane Doe");
    expect(html).toContain("creator profile has been verified");
    expect(html).toContain("I read every email personally");
  });
});

describe("getVerificationFeedbackEligibleBefore", () => {
  it("returns the cutoff seven days before the run date", () => {
    const cutoff = getVerificationFeedbackEligibleBefore(
      new Date(Date.UTC(2026, 6, 10, 15, 0, 0)),
    );

    expect(cutoff.toISOString()).toBe("2026-07-03T00:00:00.000Z");
    expect(VERIFICATION_FEEDBACK_DELAY_DAYS).toBe(7);
  });
});
