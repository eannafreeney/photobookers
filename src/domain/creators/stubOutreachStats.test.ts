import { describe, expect, it } from "vitest";
import {
  allStubViewMilestonesSent,
  hasSentAnyStubViewMilestone,
  pickNextStubViewMilestone,
} from "./stubOutreachMilestones";

describe("pickNextStubViewMilestone", () => {
  it("returns views_50 when count reaches 50 and none sent", () => {
    expect(pickNextStubViewMilestone(new Set(), 50)).toBe("views_50");
    expect(pickNextStubViewMilestone(new Set(), 62)).toBe("views_50");
  });

  it("returns views_100 after views_50 was sent", () => {
    expect(pickNextStubViewMilestone(new Set(["views_50"]), 120)).toBe(
      "views_100",
    );
  });

  it("returns null when view count is below next threshold", () => {
    expect(pickNextStubViewMilestone(new Set(["views_50"]), 87)).toBeNull();
  });

  it("returns null when all milestones sent", () => {
    const sent = new Set(["views_50", "views_100", "views_150"]);
    expect(pickNextStubViewMilestone(sent, 500)).toBeNull();
    expect(allStubViewMilestonesSent(sent)).toBe(true);
  });

  it("returns null below 50 views", () => {
    expect(pickNextStubViewMilestone(new Set(), 49)).toBeNull();
    expect(hasSentAnyStubViewMilestone(new Set())).toBe(false);
  });
});
