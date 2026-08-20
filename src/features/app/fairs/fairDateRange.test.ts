import { describe, expect, it } from "vitest";
import { formatFairDateRange, isFairRunning } from "./fairDateRange";

const utc = (iso: string) => new Date(iso);

describe("formatFairDateRange", () => {
  it("keeps a single month in the gutter label", () => {
    expect(
      formatFairDateRange(
        utc("2026-09-12T00:00:00.000Z"),
        utc("2026-09-14T00:00:00.000Z"),
      ),
    ).toEqual({ month: "Sep", days: "12–14", year: 2026 });
  });

  it("collapses a one-day fair", () => {
    expect(
      formatFairDateRange(
        utc("2026-09-12T00:00:00.000Z"),
        utc("2026-09-12T00:00:00.000Z"),
      ),
    ).toEqual({ month: "Sep", days: "12", year: 2026 });
  });

  it("names both months when the fair spans a boundary", () => {
    expect(
      formatFairDateRange(
        utc("2026-09-30T00:00:00.000Z"),
        utc("2026-10-02T00:00:00.000Z"),
      ),
    ).toEqual({ month: "", days: "Sep 30 – Oct 2", year: 2026 });
  });
});

describe("isFairRunning", () => {
  const start = utc("2026-09-12T00:00:00.000Z");
  const end = utc("2026-09-14T00:00:00.000Z");

  it("is true on the first and last day", () => {
    expect(isFairRunning(start, end, utc("2026-09-12T18:00:00.000Z"))).toBe(true);
    expect(isFairRunning(start, end, utc("2026-09-14T09:00:00.000Z"))).toBe(true);
  });

  it("is false before and after", () => {
    expect(isFairRunning(start, end, utc("2026-09-11T23:00:00.000Z"))).toBe(false);
    expect(isFairRunning(start, end, utc("2026-09-15T01:00:00.000Z"))).toBe(false);
  });
});
