import { describe, expect, it } from "vitest";
import {
  buildCreatorAnalyticsHighlightEmail,
  buildCreatorAnalyticsNudgeEmail,
  buildCreatorMilestoneEmail,
  creatorAnalyticsDigestSubject,
  creatorMilestoneEmailSubject,
} from "./emails";

describe("creatorAnalyticsDigestSubject", () => {
  it("uses highlight subject with top book when available", () => {
    expect(
      creatorAnalyticsDigestSubject({
        monthLabel: "January 2026",
        template: "highlight",
        topBookTitle: "Winter Light",
        views: 42,
      }),
    ).toBe("Your photobookers stats for January 2026 — Winter Light");
  });

  it("uses nudge subject", () => {
    expect(
      creatorAnalyticsDigestSubject({
        monthLabel: "January 2026",
        template: "nudge",
      }),
    ).toBe("A quick check-in from Photobookers");
  });
});

describe("buildCreatorAnalyticsHighlightEmail", () => {
  it("includes stats, top book, botd, and click rate", () => {
    const html = buildCreatorAnalyticsHighlightEmail({
      displayName: "Jane Doe",
      monthLabel: "January 2026",
      views: 120,
      outboundClicks: 8,
      favorites: 3,
      newFollowers: 2,
      clickRate: 7,
      topBooks: [{ title: "Winter Light", views: 84, clicks: 5 }],
      botdBookTitle: "Winter Light",
      botdDate: new Date(Date.UTC(2026, 0, 15)),
      profileUrl: "https://photobookers.com/creators/jane-doe",
      analyticsUrl:
        "https://photobookers.com/dashboard/analytics?from=2026-01-01&to=2026-01-31",
    });

    expect(html).toContain("Jane Doe");
    expect(html).toContain("120");
    expect(html).toContain("Winter Light");
    expect(html).toContain("84 views");
    expect(html).toContain(
      '<a href="https://www.photobookers.com/book-of-the-day/2026-01-15">Book of the Day</a>',
    );
    expect(html).toContain("click rate was <strong>7%</strong>");
    expect(html).toContain("/dashboard/analytics?from=2026-01-01");
  });

  it("omits click rate when views are below threshold", () => {
    const html = buildCreatorAnalyticsHighlightEmail({
      displayName: "Jane Doe",
      monthLabel: "January 2026",
      views: 5,
      outboundClicks: 0,
      favorites: 1,
      newFollowers: 0,
      clickRate: 0,
      topBooks: [{ title: "Winter Light", views: 5, clicks: 0 }],
      botdBookTitle: null,
      botdDate: null,
      profileUrl: "https://photobookers.com/creators/jane-doe",
      analyticsUrl: "https://photobookers.com/dashboard/analytics",
    });

    expect(html).not.toContain("click rate");
  });

  it("lists top books when more than one had views", () => {
    const html = buildCreatorAnalyticsHighlightEmail({
      displayName: "Jane Doe",
      monthLabel: "January 2026",
      views: 200,
      outboundClicks: 12,
      favorites: 4,
      newFollowers: 1,
      clickRate: 6,
      topBooks: [
        { title: "Winter Light", views: 84, clicks: 5 },
        { title: "Coastal Drift", views: 62, clicks: 3 },
        { title: "Night Walk", views: 41, clicks: 0 },
      ],
      botdBookTitle: null,
      botdDate: null,
      profileUrl: "https://photobookers.com/creators/jane-doe",
      analyticsUrl: "https://photobookers.com/dashboard/analytics",
    });

    expect(html).toContain("Top books:");
    expect(html).toContain("Winter Light");
    expect(html).toContain("Coastal Drift");
    expect(html).toContain("Night Walk");
    expect(html).toContain("<ul>");
  });

  it("uses your books heading when showing all books for a small catalogue", () => {
    const html = buildCreatorAnalyticsHighlightEmail({
      displayName: "Jane Doe",
      monthLabel: "January 2026",
      views: 30,
      outboundClicks: 2,
      favorites: 1,
      newFollowers: 0,
      clickRate: null,
      topBooks: [
        { title: "Winter Light", views: 20, clicks: 1 },
        { title: "Coastal Drift", views: 10, clicks: 1 },
      ],
      botdBookTitle: null,
      botdDate: null,
      profileUrl: "https://photobookers.com/creators/jane-doe",
      analyticsUrl: "https://photobookers.com/dashboard/analytics",
    });

    expect(html).toContain("Your books:");
    expect(html).not.toContain("Top books:");
  });
});

describe("buildCreatorAnalyticsNudgeEmail", () => {
  it("includes tips and single-book note", () => {
    const html = buildCreatorAnalyticsNudgeEmail({
      displayName: "Jane Doe",
      monthLabel: "January 2026",
      publishedBookCount: 1,
      profileUrl: "https://photobookers.com/creators/jane-doe",
      analyticsUrl: "https://photobookers.com/dashboard/analytics",
    });

    expect(html).toContain("didn't pick up much traffic");
    expect(html).toContain("Share your profile");
    expect(html).toContain("one book listed");
    expect(html).toContain("Reply to this message");
  });
});

describe("buildCreatorMilestoneEmail", () => {
  it("includes first wishlist copy with book title", () => {
    const html = buildCreatorMilestoneEmail({
      displayName: "Jane Doe",
      kind: "first_wishlist",
      bookTitle: "Winter Light",
      profileUrl: "https://photobookers.com/creators/jane-doe",
      analyticsUrl: "https://photobookers.com/dashboard/analytics",
    });

    expect(html).toContain("Winter Light");
    expect(html).toContain("first on Photobookers");
    expect(creatorMilestoneEmailSubject("first_wishlist", "Winter Light")).toBe(
      "First wishlist on Photobookers — Winter Light",
    );
  });

  it("includes profile views milestone copy", () => {
    const html = buildCreatorMilestoneEmail({
      displayName: "Jane Doe",
      kind: "profile_views_100",
      bookTitle: null,
      profileUrl: "https://photobookers.com/creators/jane-doe",
      analyticsUrl: "https://photobookers.com/dashboard/analytics",
    });

    expect(html).toContain("profile reached 100 views");
    expect(creatorMilestoneEmailSubject("profile_views_100", null)).toBe(
      "100 profile views on Photobookers",
    );
  });

  it("includes views milestone copy", () => {
    const html = buildCreatorMilestoneEmail({
      displayName: "Jane Doe",
      kind: "views_1000",
      bookTitle: null,
      profileUrl: "https://photobookers.com/creators/jane-doe",
      analyticsUrl: "https://photobookers.com/dashboard/analytics",
    });

    expect(html).toContain("1,000 views");
  });
});
