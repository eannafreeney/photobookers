import { describe, expect, it } from "vitest";
import { formatWeekRangeLabel, getPreviousWeekRange } from "./newsletterUtils";
import { renderWeeklyBOTDNewsletterHtml } from "./newsletterTemplate";

describe("weekly newsletter date helpers", () => {
  it("calculates previous full ISO week range", () => {
    const { weekStart, weekEnd } = getPreviousWeekRange(
      new Date(Date.UTC(2026, 4, 28)),
    );
    expect(weekStart.toISOString().slice(0, 10)).toBe("2026-05-18");
    expect(weekEnd.toISOString().slice(0, 10)).toBe("2026-05-24");
  });

  it("formats week range label as date interval", () => {
    const label = formatWeekRangeLabel(
      new Date(Date.UTC(2026, 4, 18)),
      new Date(Date.UTC(2026, 4, 24)),
    );
    expect(label).toBe("2026-05-18 to 2026-05-24");
  });
});

describe("newsletter template rendering", () => {
  it("renders fallback text when no BOTD items are present", () => {
    const html = renderWeeklyBOTDNewsletterHtml({
      weekStart: new Date(Date.UTC(2026, 4, 18)),
      weekEnd: new Date(Date.UTC(2026, 4, 24)),
      subject: "Weekly BOTD",
      introText: "Intro copy",
      outroText: "Outro copy",
      ctaText: "Explore",
      items: [],
    });

    expect(html).toContain("No BOTD entries were scheduled for this week.");
    expect(html).toContain("Weekly BOTD");
  });
});
