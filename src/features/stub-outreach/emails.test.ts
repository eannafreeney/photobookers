import { describe, expect, it } from "vitest";
import {
  generateStubViewMilestoneEmail,
  stubViewMilestoneEmailSubject,
} from "./emails";

describe("stubViewMilestoneEmailSubject", () => {
  it("includes the milestone threshold and claim CTA", () => {
    expect(stubViewMilestoneEmailSubject("views_100")).toBe(
      "Your books hit 100 views — claim to see the full stats",
    );
  });
});

describe("generateStubViewMilestoneEmail", () => {
  it("includes milestone, stats, claim link, and opt-out footer", () => {
    const html = generateStubViewMilestoneEmail({
      displayName: "Jane Doe",
      milestone: "views_50",
      allTimeViews: 62,
      stats: {
        views: 40,
        outboundClicks: 3,
        favorites: 2,
        clickRate: 7.5,
        topBookTitle: "Coastal Light",
        topBookViews: 25,
        profileUrl: "https://photobookers.com/creators/jane",
        claimUrl: "https://photobookers.com/claims/abc/start",
      },
      profileUrl: "https://photobookers.com/creators/jane",
      claimUrl: "https://photobookers.com/claims/abc/start",
    });

    expect(html).toContain("Jane Doe");
    expect(html).toContain("50 views");
    expect(html).toContain("62");
    expect(html).toContain("Coastal Light");
    expect(html).toContain("/claims/abc/start");
    expect(html).toContain("which books drove these clicks");
    expect(html).toContain("Reply to this message");
  });
});
