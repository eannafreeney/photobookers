import { describe, expect, it } from "vitest";
import { formatPeriodDelta, isMondayUtc, previousPeriodRange } from "./format";

describe("isMondayUtc", () => {
  it("returns true on Monday UTC", () => {
    expect(isMondayUtc(new Date("2026-03-02T15:00:00.000Z"))).toBe(true);
  });

  it("returns false on other weekdays", () => {
    expect(isMondayUtc(new Date("2026-03-03T00:00:00.000Z"))).toBe(false);
  });
});

describe("previousPeriodRange", () => {
  it("shifts a 7-day range back by 7 days", () => {
    const range = {
      from: new Date("2026-03-03T00:00:00.000Z"),
      to: new Date("2026-03-09T00:00:00.000Z"),
    };
    const previous = previousPeriodRange(range);
    expect(previous.from.toISOString()).toBe("2026-02-24T00:00:00.000Z");
    expect(previous.to.toISOString()).toBe("2026-03-02T00:00:00.000Z");
  });
});

describe("formatPeriodDelta", () => {
  it("formats positive change", () => {
    const delta = formatPeriodDelta(120, 100);
    expect(delta.direction).toBe("up");
    expect(delta.label).toBe("+20 (+20%) vs prior period");
  });

  it("formats negative change", () => {
    const delta = formatPeriodDelta(80, 100);
    expect(delta.direction).toBe("down");
    expect(delta.label).toBe("-20 (-20%) vs prior period");
  });

  it("handles zero previous value", () => {
    const delta = formatPeriodDelta(5, 0);
    expect(delta.direction).toBe("up");
    expect(delta.label).toBe("+5 (new) vs prior period");
  });
});
