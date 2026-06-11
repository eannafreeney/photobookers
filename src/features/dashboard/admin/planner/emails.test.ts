import { describe, expect, it } from "vitest";
import {
  buildBotdFeatureDayEmail,
  buildFeatureDayEmail,
  generateBOTDNotificationEmail,
} from "./emails";

describe("generateBOTDNotificationEmail", () => {
  it("includes the BOTD calendar date in the body", () => {
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
    expect(html).toContain("Winter Light");
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
