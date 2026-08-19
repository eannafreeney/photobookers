import { describe, expect, it } from "vitest";
import {
  buildBotdFeatureDayEmail,
  buildCreatorOfTheWeekNotificationEmail,
  buildFeatureDayEmail,
  buildPlannerWeekContentPreviewEmail,
  generateBOTDNotificationEmail,
} from "./emails";

describe("generateBOTDNotificationEmail", () => {
  it("includes the BOTD date, spotlight url, and one-week notice", () => {
    const html = generateBOTDNotificationEmail(
      {
        id: "creator-1",
        displayName: "Jane Doe",
        email: "jane@example.com",
        slug: "jane-doe",
        ownerUserId: "user-1",
        status: "verified",
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

  it("prompts unverified creators to claim their profile with benefits", () => {
    const html = generateBOTDNotificationEmail(
      {
        id: "creator-1",
        displayName: "Jane Doe",
        email: "jane@example.com",
        slug: "jane-doe",
        ownerUserId: null,
        status: "stub",
      },
      { id: "book-1", title: "Winter Light", slug: "winter-light" },
      new Date(Date.UTC(2026, 5, 1)),
    );

    expect(html).toContain("When you claim your profile, you unlock:");
    expect(html).toContain("Claim your profile");
    expect(html).toContain("/claims/creator-1/start");
  });

  it("includes login credentials and claim benefits when a new account was provisioned", () => {
    const html = generateBOTDNotificationEmail(
      {
        id: "creator-1",
        displayName: "Jane Doe",
        email: "jane@example.com",
        slug: "jane-doe",
        ownerUserId: "user-1",
        status: "stub",
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
    expect(html).toContain("When you claim your profile, you unlock:");
  });

  it("includes a login link and claim benefits when an existing account was linked", () => {
    const html = generateBOTDNotificationEmail(
      {
        id: "creator-1",
        displayName: "Jane Doe",
        email: "jane@example.com",
        slug: "jane-doe",
        ownerUserId: "user-1",
        status: "stub",
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
    expect(html).toContain("When you claim your profile, you unlock:");
  });
});

describe("buildCreatorOfTheWeekNotificationEmail", () => {
  it("includes claim benefits for unverified creators", () => {
    const html = buildCreatorOfTheWeekNotificationEmail({
      id: "creator-1",
      displayName: "Jane Doe",
      email: "jane@example.com",
      slug: "jane-doe",
      type: "artist",
      ownerUserId: null,
      status: "stub",
      weekStart: new Date(Date.UTC(2026, 5, 2)),
      interviewLink: null,
      interviewStatus: null,
    });

    expect(html).toContain("Artist of the Week");
    expect(html).toContain("When you claim your profile, you unlock:");
    expect(html).toContain("/claims/creator-1/start");
  });

  it("omits claim benefits for verified creators", () => {
    const html = buildCreatorOfTheWeekNotificationEmail({
      id: "creator-1",
      displayName: "Jane Doe",
      email: "jane@example.com",
      slug: "jane-doe",
      type: "publisher",
      ownerUserId: "user-1",
      status: "verified",
      weekStart: new Date(Date.UTC(2026, 5, 2)),
      interviewLink: null,
      interviewStatus: null,
    });

    expect(html).toContain("Publisher of the Week");
    expect(html).not.toContain("Claim your profile");
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
  it("renders Instagram story preview images", () => {
    const weekStart = new Date(Date.UTC(2026, 6, 13));
    const html = buildPlannerWeekContentPreviewEmail({
      weekStart,
      items: [
        {
          kind: "botd",
          date: new Date(Date.UTC(2026, 6, 13)),
          title: "Winter Light",
          artistName: "Jane Doe",
          publisherName: "Press",
          featuredImageUrl: "https://example.com/hero.jpg",
          artistProvidedStoryImageUrl: null,
          instagramImageUrls: [
            "https://example.com/cover.jpg",
            "https://example.com/page1.jpg",
          ],
          sourceText: "Source",
          spotlightBlurb: "Rewritten blurb",
          instagramCaption: "Caption text",
        },
      ],
      storyPreviewUrls: new Map([
        ["botd-2026-07-13", ["https://example.com/story-preview.webp"]],
      ]),
      prepWarnings: [],
      plannerUrl: "https://example.com/planner",
      featuredHeroUrl: "https://example.com/featured-hero",
      instagramPrepUrl: "https://example.com/instagram",
    });

    expect(html).toContain("Instagram story preview");
    expect(html).toContain("https://example.com/story-preview.webp");
    expect(html).not.toContain("https://example.com/cover.jpg");
    expect(html).not.toContain("https://example.com/hero.jpg");
    expect(html).not.toContain("Instagram feed preview");
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
