import { describe, expect, it } from "vitest";
import {
  buildBotdFeatureDayEmail,
  buildFeatureDayEmail,
  buildPlannerWeekContentPreviewEmail,
  generateBOTDNotificationEmail,
} from "./emails";

describe("generateBOTDNotificationEmail", () => {
  it("includes the BOTD date, spotlight url, and one-week notice", () => {
    const html = generateBOTDNotificationEmail(
      {
        displayName: "Jane Doe",
        email: "jane@example.com",
        slug: "jane-doe",
        ownerUserId: "user-1",
      },
      { id: "book-1", title: "Winter Light", slug: "winter-light" },
      new Date(Date.UTC(2026, 5, 1)),
    );

    expect(html).toContain("Monday, June 1, 2026");
    expect(html).toContain("one week from today");
    expect(html).toContain("Winter Light");
    expect(html).toContain("/book-of-the-day/2026-06-01");
    expect(html).toContain("make sure your bio");
    expect(html).not.toContain("Claim your profile");
  });

  it("prompts unclaimed creators to claim their profile", () => {
    const html = generateBOTDNotificationEmail(
      {
        displayName: "Jane Doe",
        email: "jane@example.com",
        slug: "jane-doe",
        ownerUserId: null,
      },
      { id: "book-1", title: "Winter Light", slug: "winter-light" },
      new Date(Date.UTC(2026, 5, 1)),
    );

    expect(html).toContain("claim your profile");
    expect(html).toContain("/dashboard/creators/jane-doe");
  });

  it("includes login credentials when a new account was provisioned", () => {
    const html = generateBOTDNotificationEmail(
      {
        displayName: "Jane Doe",
        email: "jane@example.com",
        slug: "jane-doe",
        ownerUserId: "user-1",
      },
      { id: "book-1", title: "Winter Light", slug: "winter-light" },
      new Date(Date.UTC(2026, 5, 1)),
      {
        kind: "created",
        email: "jane@example.com",
        temporaryPassword: "temp-pass-123",
        loginUrl:
          "https://www.photobookers.com/auth/login?email=jane%40example.com&password=temp-pass-123",
      },
    );

    expect(html).toContain("We created a Photobookers account for you");
    expect(html).toContain("temp-pass-123");
    expect(html).toContain("Log in to your profile");
    expect(html).not.toContain("claim your profile");
  });

  it("includes a login link when an existing account was linked", () => {
    const html = generateBOTDNotificationEmail(
      {
        displayName: "Jane Doe",
        email: "jane@example.com",
        slug: "jane-doe",
        ownerUserId: "user-1",
      },
      { id: "book-1", title: "Winter Light", slug: "winter-light" },
      new Date(Date.UTC(2026, 5, 1)),
      {
        kind: "linked",
        email: "jane@example.com",
        loginUrl: "https://www.photobookers.com/auth/login?email=jane%40example.com",
      },
    );

    expect(html).toContain("linked your existing Photobookers account");
    expect(html).toContain("Log in");
    expect(html).not.toContain("claim your profile");
  });
});

describe("buildBotdFeatureDayEmail", () => {
  it("includes a share kit for the artist with botd and digest links", () => {
    const botdDate = new Date(Date.UTC(2026, 5, 8));
    const spotlightUrl = "https://www.photobookers.com/book-of-the-day/2026-06-08";
    const html = buildBotdFeatureDayEmail({
      displayName: "Jane Doe",
      recipientType: "artist",
      bookTitle: "Winter Light",
      artistName: "Jane Doe",
      botdDate,
      spotlightUrl,
      instagram: "@janedoe",
    });

    expect(html).toContain("Book of the Day");
    expect(html).toContain("Winter Light");
    expect(html).toContain("Share kit");
    expect(html).toContain("Book of the Day on @photobookers today");
    expect(html).toContain(spotlightUrl);
    expect(html).toContain("@janedoe");
    expect(html).toContain("/this-week?week=2026-W24");
  });

  it("uses publisher copy in the share kit", () => {
    const html = buildBotdFeatureDayEmail({
      displayName: "Acme Press",
      recipientType: "publisher",
      bookTitle: "Winter Light",
      artistName: "Jane Doe",
      botdDate: new Date(Date.UTC(2026, 5, 8)),
      spotlightUrl: "https://www.photobookers.com/book-of-the-day/2026-06-08",
    });

    expect(html).toContain("Winter Light&quot; by Jane Doe is Book of the Day");
  });
});

describe("buildPlannerWeekContentPreviewEmail", () => {
  it("renders all selected Instagram carousel images", () => {
    const weekStart = new Date(Date.UTC(2026, 6, 13));
    const html = buildPlannerWeekContentPreviewEmail({
      weekStart,
      items: [
        {
          kind: "botd",
          date: new Date(Date.UTC(2026, 6, 13)),
          title: "Winter Light",
          featuredImageUrl: "https://example.com/hero.jpg",
          instagramImageUrls: [
            "https://example.com/cover.jpg",
            "https://example.com/page1.jpg",
            "https://example.com/page2.jpg",
          ],
          sourceText: "Source",
          spotlightBlurb: "Rewritten blurb",
          instagramCaption: "Caption text",
        },
      ],
      prepWarnings: [],
      plannerUrl: "https://example.com/planner",
      featuredHeroUrl: "https://example.com/featured-hero",
      instagramPrepUrl: "https://example.com/instagram",
    });

    expect(html).toContain("https://example.com/cover.jpg");
    expect(html).toContain("https://example.com/page1.jpg");
    expect(html).toContain("https://example.com/page2.jpg");
    expect(html).not.toContain("https://example.com/hero.jpg");
    expect(html).toContain("(1 of 3)");
    expect(html).toContain("(3 of 3)");
  });
});

describe("buildFeatureDayEmail", () => {
  it("includes a share kit with instagram caption and spotlight links", () => {
    const weekStart = new Date(Date.UTC(2026, 5, 2));
    const spotlightUrl =
      "https://www.photobookers.com/artist-of-the-week/2026-W23";
    const html = buildFeatureDayEmail({
      displayName: "Jane Doe",
      type: "artist",
      weekStart,
      spotlightUrl,
      interviewLink: null,
      interviewStatus: null,
      instagram: "@janedoe",
    });

    expect(html).toContain("Share kit");
    expect(html).toContain("Artist of the Week on @photobookers this week");
    expect(html).toContain(spotlightUrl);
    expect(html).toContain("@janedoe");
    expect(html).toContain("#photobook");
    expect(html).toContain("/this-week?week=2026-W23");
  });
});
