import { describe, expect, it } from "vitest";
import { buildVerifiedCreatorInstagramDueAt } from "./instagramUtils";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("buildVerifiedCreatorInstagramDueAt", () => {
  it("schedules Monday runs for Tuesday at the post time", () => {
    // 2026-07-13 is a Monday.
    const from = new Date(Date.UTC(2026, 6, 13, 11, 0, 0));
    const due = buildVerifiedCreatorInstagramDueAt(from);
    expect(due.toISOString()).toBe("2026-07-14T14:00:00.000Z");
    expect(due.getUTCDay()).toBe(2); // Tuesday
  });

  it("schedules Wednesday runs for Thursday at the post time", () => {
    // 2026-07-15 is a Wednesday.
    const from = new Date(Date.UTC(2026, 6, 15, 11, 0, 0));
    const due = buildVerifiedCreatorInstagramDueAt(from);
    expect(due.toISOString()).toBe("2026-07-16T14:00:00.000Z");
    expect(due.getUTCDay()).toBe(4); // Thursday
  });

  it("always lands on a Tuesday or Thursday at least 24h out", () => {
    for (let hour = 0; hour < 24 * 7; hour++) {
      const from = new Date(Date.UTC(2026, 6, 6, 0, 0, 0) + hour * 60 * 60 * 1000);
      const due = buildVerifiedCreatorInstagramDueAt(from);
      expect([2, 4]).toContain(due.getUTCDay());
      expect(due.getTime() - from.getTime()).toBeGreaterThanOrEqual(DAY_MS);
    }
  });
});
