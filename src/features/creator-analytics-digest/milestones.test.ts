import { describe, expect, it } from "vitest";
import {
  digestHasActivity,
  milestonesToCascadeMark,
  pickNextMilestone,
} from "./milestones";

describe("digestHasActivity", () => {
  it("is false when all metrics are zero", () => {
    expect(
      digestHasActivity({
        views: 0,
        outboundClicks: 0,
        wishlists: 0,
        collections: 0,
        newFollowers: 0,
      }),
    ).toBe(false);
  });

  it("is true when any metric is positive", () => {
    expect(
      digestHasActivity({
        views: 0,
        outboundClicks: 0,
        wishlists: 1,
        collections: 0,
        newFollowers: 0,
      }),
    ).toBe(true);
  });
});

describe("milestonesToCascadeMark", () => {
  it("cascades view tiers", () => {
    expect(milestonesToCascadeMark("views_1000")).toEqual([
      "views_100",
      "views_500",
      "views_1000",
    ]);
  });

  it("cascades profile view tiers", () => {
    expect(milestonesToCascadeMark("profile_views_100")).toEqual([
      "profile_views_50",
      "profile_views_100",
    ]);
  });

  it("cascades follower tiers", () => {
    expect(milestonesToCascadeMark("followers_50")).toEqual([
      "first_follower",
      "followers_10",
      "followers_50",
    ]);
  });
});

describe("pickNextMilestone", () => {
  it("prioritises first wishlist over view tiers", () => {
    const milestone = pickNextMilestone(new Set(), {
      hasWishlist: true,
      hasOutboundClick: true,
      followerCount: 50,
      profileViewCount: 200,
      viewCount: 2000,
    });
    expect(milestone).toBe("first_wishlist");
  });

  it("returns highest unsent view tier", () => {
    const milestone = pickNextMilestone(new Set(["first_wishlist"]), {
      hasWishlist: true,
      hasOutboundClick: false,
      followerCount: 0,
      profileViewCount: 0,
      viewCount: 2000,
    });
    expect(milestone).toBe("views_1000");
  });

  it("returns highest unsent profile view tier", () => {
    const milestone = pickNextMilestone(new Set(["first_wishlist"]), {
      hasWishlist: true,
      hasOutboundClick: false,
      followerCount: 0,
      profileViewCount: 120,
      viewCount: 0,
    });
    expect(milestone).toBe("profile_views_100");
  });

  it("returns null when all milestones are sent", () => {
    const sent = new Set([
      "first_wishlist",
      "first_follower",
      "followers_10",
      "followers_50",
      "profile_views_50",
      "profile_views_100",
      "views_100",
      "views_500",
      "views_1000",
    ]);
    const milestone = pickNextMilestone(sent, {
      hasWishlist: true,
      hasOutboundClick: true,
      followerCount: 100,
      profileViewCount: 500,
      viewCount: 5000,
    });
    expect(milestone).toBeNull();
  });
});
