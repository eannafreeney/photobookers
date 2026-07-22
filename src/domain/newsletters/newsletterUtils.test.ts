import { describe, expect, it } from "vitest";
import { toDateString } from "../../lib/utils";
import {
  getCurrentNewsletterRange,
  getNewsletterRangeStartForPlannerWeek,
  getNextNewsletterRange,
} from "./newsletterUtils";

describe("getCurrentNewsletterRange", () => {
  it("uses the current Wednesday edition on send day", () => {
    const { weekStart, weekEnd } = getCurrentNewsletterRange(
      new Date(Date.UTC(2026, 6, 8)),
    );
    expect(toDateString(weekStart)).toBe("2026-07-02");
    expect(toDateString(weekEnd)).toBe("2026-07-08");
  });

  it("switches to the next edition from Friday onward", () => {
    const { weekStart, weekEnd } = getCurrentNewsletterRange(
      new Date(Date.UTC(2026, 6, 10)),
    );
    expect(toDateString(weekStart)).toBe("2026-07-09");
    expect(toDateString(weekEnd)).toBe("2026-07-15");
  });
});

describe("getNextNewsletterRange", () => {
  it("returns the next Thu–Wed edition when run on a Tuesday", () => {
    // Tuesday Jul 7, 2026: current edition ends Wed Jul 8, so next is Jul 9–15.
    const { weekStart, weekEnd } = getNextNewsletterRange(
      new Date(Date.UTC(2026, 6, 7)),
    );
    expect(toDateString(weekStart)).toBe("2026-07-09");
    expect(toDateString(weekEnd)).toBe("2026-07-15");
  });
});

describe("getNewsletterRangeStartForPlannerWeek", () => {
  it("maps ISO weeks 28 and 29 to their Thu–Wed editions", () => {
    expect(
      toDateString(
        getNewsletterRangeStartForPlannerWeek(new Date(Date.UTC(2026, 6, 6))),
      ),
    ).toBe("2026-07-02");
    expect(
      toDateString(
        getNewsletterRangeStartForPlannerWeek(new Date(Date.UTC(2026, 6, 13))),
      ),
    ).toBe("2026-07-09");
  });
});
