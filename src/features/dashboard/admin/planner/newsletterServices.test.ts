import { describe, expect, it } from "vitest";
import { formatWeekRangeLabel, getPreviousWeekRange } from "./newsletterUtils";
import { renderWeeklyBOTDNewsletterHtml } from "./newsletterTemplate";

describe("weekly newsletter date helpers", () => {
  it("calculates previous full ISO week range", () => {
    const { weekStart, weekEnd } = getPreviousWeekRange(
      new Date(Date.UTC(2026, 4, 28)),
    );
    expect(weekStart.toISOString().slice(0, 10)).toBe("2026-05-18");
    expect(weekEnd.toISOString().slice(0, 10)).toBe("2026-05-24");
  });

  it("formats week range label as date interval", () => {
    const label = formatWeekRangeLabel(
      new Date(Date.UTC(2026, 4, 18)),
      new Date(Date.UTC(2026, 4, 24)),
    );
    expect(label).toBe("2026-05-18 to 2026-05-24");
  });
});

describe("newsletter template rendering", () => {
  it("renders fallback text when no BOTD items are present", () => {
    const html = renderWeeklyBOTDNewsletterHtml({
      weekStart: new Date(Date.UTC(2026, 4, 18)),
      weekEnd: new Date(Date.UTC(2026, 4, 24)),
      subject: "Weekly BOTD",
      introText: "Intro copy",
      outroText: "Outro copy",
      ctaText: "Explore",
      items: [],
      artistOfTheWeek: null,
      publisherOfTheWeek: null,
    });

    expect(html).toContain("No BOTD entries were scheduled for this week.");
    expect(html).toContain("Weekly BOTD");
    expect(html).toContain("Photobookers");
    expect(html).toContain("Instrument Sans");
    expect(html).toContain("card-media");
    expect(html).toContain("card-body");
    expect(html).toContain("@media only screen and (max-width: 600px)");
  });

  it("renders artist and publisher of the week spotlights", () => {
    const html = renderWeeklyBOTDNewsletterHtml({
      weekStart: new Date(Date.UTC(2026, 4, 18)),
      weekEnd: new Date(Date.UTC(2026, 4, 24)),
      subject: "Weekly roundup",
      introText: "Intro copy",
      outroText: "Outro copy",
      ctaText: "Explore",
      items: [],
      artistOfTheWeek: {
        displayName: "Jane Artist",
        slug: "jane-artist",
        coverUrl: "https://example.com/artist.jpg",
        tagline: "Documentary photographer",
        location: "Berlin, Germany",
      },
      publisherOfTheWeek: {
        displayName: "Acme Press",
        slug: "acme-press",
        coverUrl: "https://example.com/publisher.jpg",
        tagline: null,
        location: "London, UK",
      },
    });

    expect(html).toContain("Artist of the week");
    expect(html).toContain("Documentary photographer");
    expect(html).toContain("Berlin, Germany");
    expect(html).toContain("London, UK");
    expect(html).toContain('class="email-btn-primary"');
    expect(html).toContain("View profile");
    expect(html).toContain("Jane Artist");
    expect(html).toContain("/creators/jane-artist");
    expect(html).toContain("Publisher of the week");
    expect(html).toContain("Acme Press");
    expect(html).toContain("/creators/acme-press");
    expect(
      (html.match(/class="card-img card-img-creator"/g) ?? []).length,
    ).toBe(2);
  });

  it("formats BOTD item dates for display", () => {
    const html = renderWeeklyBOTDNewsletterHtml({
      weekStart: new Date(Date.UTC(2026, 4, 18)),
      weekEnd: new Date(Date.UTC(2026, 4, 24)),
      subject: "Weekly roundup",
      introText: "Intro",
      outroText: "Outro",
      ctaText: "Explore",
      items: [
        {
          date: "2026-05-31",
          bookId: "id",
          bookSlug: "some-book",
          title: "Some Book",
          coverUrl: null,
          artistName: null,
          artistSlug: null,
          publisherName: null,
          publisherSlug: null,
        },
      ],
      artistOfTheWeek: null,
      publisherOfTheWeek: null,
    });

    expect(html).toContain("May 31, 2026");
    expect(html).not.toContain("2026-05-31");
    expect(html).toContain("View book");
    expect(html).toContain('class="email-btn-primary"');
  });
});
