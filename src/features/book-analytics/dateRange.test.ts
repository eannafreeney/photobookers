import { describe, expect, it, vi, afterEach } from "vitest";
import {
  analyticsSearchParams,
  eachDayInRange,
  formatAnalyticsDateRangeLabel,
  formatMonthLabel,
  matchesPreset,
  monthKeyFromRange,
  parseAnalyticsDateRange,
  parseMonthKey,
  presetAnalyticsDateRange,
  previousCalendarMonthRange,
} from "./dateRange";

describe("presetAnalyticsDateRange", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns today only for a 1-day preset", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-19T15:00:00Z"));

    const range = presetAnalyticsDateRange(1);
    expect(range.from.toISOString()).toBe("2026-06-19T00:00:00.000Z");
    expect(range.to.toISOString()).toBe("2026-06-19T00:00:00.000Z");
  });

  it("returns an inclusive range ending today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-19T15:00:00Z"));

    const range = presetAnalyticsDateRange(7);
    expect(range.from.toISOString()).toBe("2026-06-13T00:00:00.000Z");
    expect(range.to.toISOString()).toBe("2026-06-19T00:00:00.000Z");
  });
});

describe("parseAnalyticsDateRange", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null when params are missing", () => {
    expect(parseAnalyticsDateRange()).toBeNull();
    expect(parseAnalyticsDateRange("2026-01-01")).toBeNull();
  });

  it("returns null for invalid dates", () => {
    expect(parseAnalyticsDateRange("bad", "2026-01-01")).toBeNull();
    expect(parseAnalyticsDateRange("2026-01-01", "bad")).toBeNull();
    expect(parseAnalyticsDateRange("2026-02-30", "2026-03-01")).toBeNull();
  });

  it("returns null when from is after to", () => {
    expect(parseAnalyticsDateRange("2026-03-01", "2026-02-01")).toBeNull();
  });

  it("caps to at today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-19T12:00:00Z"));

    const range = parseAnalyticsDateRange("2026-06-01", "2026-12-31");
    expect(range).toEqual({
      from: new Date("2026-06-01T00:00:00.000Z"),
      to: new Date("2026-06-19T00:00:00.000Z"),
    });
  });

  it("parses a valid inclusive range", () => {
    const range = parseAnalyticsDateRange("2026-03-01", "2026-03-31");
    expect(range).toEqual({
      from: new Date("2026-03-01T00:00:00.000Z"),
      to: new Date("2026-03-31T00:00:00.000Z"),
    });
  });
});

describe("formatAnalyticsDateRangeLabel", () => {
  it("labels all time", () => {
    expect(formatAnalyticsDateRangeLabel(null)).toBe("All time");
  });

  it("labels a single day", () => {
    expect(
      formatAnalyticsDateRangeLabel({
        from: new Date("2026-03-01T00:00:00.000Z"),
        to: new Date("2026-03-01T00:00:00.000Z"),
      }),
    ).toBe("1st March 2026");
  });

  it("labels a date span", () => {
    expect(
      formatAnalyticsDateRangeLabel({
        from: new Date("2026-03-01T00:00:00.000Z"),
        to: new Date("2026-03-31T00:00:00.000Z"),
      }),
    ).toBe("1st March 2026 – 31st March 2026");
  });
});

describe("analyticsSearchParams", () => {
  it("returns empty string for all time", () => {
    expect(analyticsSearchParams(null)).toBe("");
  });

  it("builds query params for a range", () => {
    expect(
      analyticsSearchParams({
        from: new Date("2026-03-01T00:00:00.000Z"),
        to: new Date("2026-03-31T00:00:00.000Z"),
      }),
    ).toBe("?from=2026-03-01&to=2026-03-31");
  });
});

describe("matchesPreset", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("matches preset ranges", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-19T12:00:00Z"));

    expect(matchesPreset(presetAnalyticsDateRange(1), 1)).toBe(true);
    expect(matchesPreset(presetAnalyticsDateRange(30), 30)).toBe(true);
    expect(matchesPreset(presetAnalyticsDateRange(7), 30)).toBe(false);
    expect(matchesPreset(null, 7)).toBe(false);
  });
});

describe("eachDayInRange", () => {
  it("lists each UTC day inclusively", () => {
    expect(
      eachDayInRange({
        from: new Date("2026-03-01T00:00:00.000Z"),
        to: new Date("2026-03-03T00:00:00.000Z"),
      }),
    ).toEqual(["2026-03-01", "2026-03-02", "2026-03-03"]);
  });
});

describe("previousCalendarMonthRange", () => {
  it("returns the full previous calendar month", () => {
    const range = previousCalendarMonthRange(
      new Date("2026-02-03T12:00:00.000Z"),
    );
    expect(range.from.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(range.to.toISOString()).toBe("2026-01-31T00:00:00.000Z");
  });
});

describe("formatMonthLabel", () => {
  it("formats month and year", () => {
    expect(
      formatMonthLabel({
        from: new Date("2026-01-01T00:00:00.000Z"),
        to: new Date("2026-01-31T00:00:00.000Z"),
      }),
    ).toBe("January 2026");
  });
});

describe("monthKeyFromRange", () => {
  it("returns YYYY-MM", () => {
    expect(
      monthKeyFromRange({
        from: new Date("2026-01-01T00:00:00.000Z"),
        to: new Date("2026-01-31T00:00:00.000Z"),
      }),
    ).toBe("2026-01");
  });
});

describe("parseMonthKey", () => {
  it("parses a calendar month", () => {
    expect(parseMonthKey("2026-03")).toEqual({
      from: new Date("2026-03-01T00:00:00.000Z"),
      to: new Date("2026-03-31T00:00:00.000Z"),
    });
  });

  it("returns null for invalid keys", () => {
    expect(parseMonthKey("2026-13")).toBeNull();
    expect(parseMonthKey("bad")).toBeNull();
  });
});
