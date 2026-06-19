import { describe, expect, it, vi } from "vitest";

vi.mock("../../db/client", () => ({
  db: {},
}));

import { mergeDailyFunnelTrends, mergeDailySourceTrends } from "./trends";

const range = {
  from: new Date("2026-03-01T00:00:00.000Z"),
  to: new Date("2026-03-03T00:00:00.000Z"),
};

describe("mergeDailyFunnelTrends", () => {
  it("zero-fills missing days", () => {
    const result = mergeDailyFunnelTrends(
      range,
      [{ day: "2026-03-01", value: 10 }],
      [{ day: "2026-03-02", value: 2 }],
      [{ day: "2026-03-03", value: 1 }],
      [],
    );

    expect(result).toEqual([
      { date: "2026-03-01", views: 10, clicks: 0, wishlists: 0, collections: 0 },
      { date: "2026-03-02", views: 0, clicks: 2, wishlists: 0, collections: 0 },
      { date: "2026-03-03", views: 0, clicks: 0, wishlists: 1, collections: 0 },
    ]);
  });
});

describe("mergeDailySourceTrends", () => {
  it("groups source counts by day and zero-fills gaps", () => {
    const result = mergeDailySourceTrends(
      range,
      [
        { day: "2026-03-01", source: "web", value: 8 },
        { day: "2026-03-01", source: "hyperview", value: 2 },
      ],
      [{ day: "2026-03-02", source: "web", value: 1 }],
    );

    expect(result).toEqual([
      {
        date: "2026-03-01",
        viewsWeb: 8,
        viewsHyperview: 2,
        clicksWeb: 0,
        clicksHyperview: 0,
      },
      {
        date: "2026-03-02",
        viewsWeb: 0,
        viewsHyperview: 0,
        clicksWeb: 1,
        clicksHyperview: 0,
      },
      {
        date: "2026-03-03",
        viewsWeb: 0,
        viewsHyperview: 0,
        clicksWeb: 0,
        clicksHyperview: 0,
      },
    ]);
  });
});
