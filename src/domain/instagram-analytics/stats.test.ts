import { describe, expect, it } from "vitest";
import type { InstagramPost } from "../../lib/instagram-graph";
import {
  avgEngagement,
  insightsToEmailHtml,
  postsInLastDays,
} from "./stats";
import { instagramWeeklyDigestSubject } from "./emails";

function post(overrides: Partial<InstagramPost> & { timestamp: string }): InstagramPost {
  return {
    id: "1",
    media_type: "IMAGE",
    permalink: "https://instagram.com/p/x",
    like_count: 10,
    comments_count: 1,
    insights: {
      reach: 100,
      impressions: 120,
      saved: 2,
      shares: 1,
      engagement: 5,
    },
    ...overrides,
  };
}

describe("instagram-analytics stats", () => {
  it("filters posts to last N days", () => {
    const asOf = new Date("2026-08-01T12:00:00Z");
    const posts = [
      post({ id: "a", timestamp: "2026-07-30T10:00:00Z" }),
      post({ id: "b", timestamp: "2026-07-20T10:00:00Z" }),
    ];
    expect(postsInLastDays(posts, 7, asOf).map((p) => p.id)).toEqual(["a"]);
  });

  it("averages engagement", () => {
    const posts = [
      post({
        timestamp: "2026-08-01T00:00:00Z",
        insights: {
          reach: 1,
          impressions: 1,
          saved: 0,
          shares: 0,
          engagement: 2,
        },
      }),
      post({
        timestamp: "2026-08-01T00:00:00Z",
        insights: {
          reach: 1,
          impressions: 1,
          saved: 0,
          shares: 0,
          engagement: 4,
        },
      }),
    ];
    expect(avgEngagement(posts)).toBe(3);
  });

  it("converts bold markdown for email", () => {
    const html = insightsToEmailHtml("**Top performers**\n\nLook at saves.");
    expect(html).toContain("<strong>Top performers</strong>");
    expect(html).toContain("Look at saves.");
  });
});

describe("instagram weekly digest subject", () => {
  it("includes week label", () => {
    expect(instagramWeeklyDigestSubject("2026-07-26 → 2026-08-01")).toBe(
      "Instagram weekly digest — 2026-07-26 → 2026-08-01",
    );
  });
});
