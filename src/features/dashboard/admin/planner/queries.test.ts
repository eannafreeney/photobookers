import { describe, expect, it } from "vitest";
import { toDateString, toWeekString } from "../../../../lib/utils";
import { mapPlannerNewsletterByWeekStart } from "./newsletterPlanner";

describe("mapPlannerNewsletterByWeekStart", () => {
  const currentWeek = new Date(Date.UTC(2026, 6, 6));
  const nextWeek = new Date(Date.UTC(2026, 6, 13));

  it("maps each planner week to its Thu–Wed newsletter edition", () => {
    const byWeek = mapPlannerNewsletterByWeekStart(
      [currentWeek, nextWeek],
      [
        {
          id: "current",
          status: "sent",
          weekStart: new Date(Date.UTC(2026, 6, 2)),
          sentAt: new Date(Date.UTC(2026, 6, 8, 9, 0)),
        },
        {
          id: "next-draft",
          status: "draft",
          weekStart: new Date(Date.UTC(2026, 6, 9)),
          sentAt: null,
        },
      ],
    );

    expect(byWeek.get(toWeekString(currentWeek))).toMatchObject({
      status: "sent",
      campaignId: "current",
    });
    expect(toDateString(byWeek.get(toWeekString(currentWeek))!.weekStart)).toBe(
      "2026-07-02",
    );

    expect(byWeek.get(toWeekString(nextWeek))).toMatchObject({
      status: "draft",
      campaignId: "next-draft",
    });
    expect(toDateString(byWeek.get(toWeekString(nextWeek))!.weekStart)).toBe(
      "2026-07-09",
    );
  });

  it("does not attach a next-week edition to the current planner week", () => {
    const byWeek = mapPlannerNewsletterByWeekStart(
      [currentWeek, nextWeek],
      [
        {
          id: "campaign-1",
          status: "sent",
          weekStart: new Date(Date.UTC(2026, 6, 9)),
          sentAt: new Date(Date.UTC(2026, 6, 9, 9, 0)),
        },
      ],
    );

    expect(byWeek.get(toWeekString(currentWeek))).toMatchObject({
      status: null,
      campaignId: null,
    });
    expect(toDateString(byWeek.get(toWeekString(currentWeek))!.weekStart)).toBe(
      "2026-07-02",
    );

    expect(byWeek.get(toWeekString(nextWeek))).toMatchObject({
      status: "sent",
      campaignId: "campaign-1",
    });
    expect(toDateString(byWeek.get(toWeekString(nextWeek))!.weekStart)).toBe(
      "2026-07-09",
    );
  });
});
