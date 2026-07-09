import { describe, expect, it } from "vitest";
import { toDateString, toWeekString } from "../../../../lib/utils";
import { mapPlannerNewsletterByWeekStart } from "./newsletterPlanner";

describe("mapPlannerNewsletterByWeekStart", () => {
  it("keeps a Thursday-sent newsletter on the current planner week", () => {
    const currentWeek = new Date(Date.UTC(2026, 6, 6));
    const nextWeek = new Date(Date.UTC(2026, 6, 13));
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
      status: "sent",
      campaignId: "campaign-1",
    });
    expect(
      toDateString(byWeek.get(toWeekString(currentWeek))!.weekStart),
    ).toBe("2026-07-09");

    expect(byWeek.get(toWeekString(nextWeek))).toMatchObject({
      status: null,
      campaignId: null,
    });
    expect(toDateString(byWeek.get(toWeekString(nextWeek))!.weekStart)).toBe(
      "2026-07-16",
    );
  });
});
