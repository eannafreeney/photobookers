import { describe, expect, it } from "vitest";
import { toWeekStart, toWeekString } from "../../../../lib/utils";
import {
  formatNewsletterWeekRange,
  formatWeekRangeLabel,
  getCurrentNewsletterRange,
  getNewsletterRangeForSendWednesday,
  getNewsletterRangeStartForPlannerWeek,
  isNewsletterSendDay,
  resolveNewsletterRangeStart,
} from "./newsletterUtils";
import { renderWeeklyBOTDNewsletterHtml } from "./newsletterTemplate";
import { renderWeeklyBOTDNewsletterHtmlMjml } from "./newsletterTemplateMjml";

const sampleNewsletterParams = {
  weekStart: new Date(Date.UTC(2026, 4, 18)),
  weekEnd: new Date(Date.UTC(2026, 4, 24)),
  subject: "Weekly BOTD",
  introText: "Intro copy",
  outroText: "Outro copy",
  ctaText: "Explore",
  items: [] as const,
  artistOfTheWeek: null,
  publisherOfTheWeek: null,
};

describe("weekly newsletter date helpers", () => {
  it("uses Thu–Wed range ending on send Wednesday", () => {
    const { weekStart, weekEnd } = getCurrentNewsletterRange(
      new Date(Date.UTC(2026, 5, 3)),
    );
    expect(weekStart.toISOString().slice(0, 10)).toBe("2026-05-28");
    expect(weekEnd.toISOString().slice(0, 10)).toBe("2026-06-03");
  });

  it("looks ahead to the next Wednesday before send day", () => {
    const { weekStart, weekEnd } = getCurrentNewsletterRange(
      new Date(Date.UTC(2026, 5, 2)),
    );
    expect(weekStart.toISOString().slice(0, 10)).toBe("2026-05-28");
    expect(weekEnd.toISOString().slice(0, 10)).toBe("2026-06-03");
  });

  it("maps planner Monday weeks to the Thursday range start", () => {
    const rangeStart = getNewsletterRangeStartForPlannerWeek(
      new Date(Date.UTC(2026, 5, 1)),
    );
    expect(rangeStart.toISOString().slice(0, 10)).toBe("2026-05-28");
  });

  it("detects Wednesday as the newsletter send day", () => {
    expect(isNewsletterSendDay(new Date(Date.UTC(2026, 5, 3)))).toBe(true);
    expect(isNewsletterSendDay(new Date(Date.UTC(2026, 5, 4)))).toBe(false);
  });

  it("builds range from an explicit send Wednesday", () => {
    const { weekStart, weekEnd } = getNewsletterRangeForSendWednesday(
      new Date(Date.UTC(2026, 5, 3)),
    );
    expect(weekStart.toISOString().slice(0, 10)).toBe("2026-05-28");
    expect(weekEnd.toISOString().slice(0, 10)).toBe("2026-06-03");
  });

  it("formats week range label as date interval", () => {
    const label = formatWeekRangeLabel(
      new Date(Date.UTC(2026, 4, 18)),
      new Date(Date.UTC(2026, 4, 24)),
    );
    expect(label).toBe("2026-05-18 to 2026-05-24");
  });

  it("resolves legacy planner Monday links to the Thursday range start", () => {
    const rangeStart = resolveNewsletterRangeStart(
      new Date(Date.UTC(2026, 5, 1)),
    );
    expect(rangeStart.toISOString().slice(0, 10)).toBe("2026-05-28");
  });

  it("formats edition as Thu–Wed weekday labels", () => {
    const label = formatNewsletterWeekRange(
      new Date(Date.UTC(2026, 4, 28)),
      new Date(Date.UTC(2026, 5, 3)),
    );
    expect(label).toBe("Thu, May 28 – Wed, Jun 3");
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
    const weekEnd = new Date(Date.UTC(2026, 4, 24));
    const spotlightWeekKey = toWeekString(toWeekStart(weekEnd));
    const html = renderWeeklyBOTDNewsletterHtml({
      weekStart: new Date(Date.UTC(2026, 4, 18)),
      weekEnd,
      subject: "Weekly roundup",
      introText: "Intro copy",
      outroText: "Outro copy",
      ctaText: "Explore",
      items: [],
      artistOfTheWeek: {
        displayName: "Jane Artist",
        slug: "jane-artist",
        weekKey: spotlightWeekKey,
        coverUrl: "https://example.com/artist.jpg",
        tagline: "Documentary photographer",
        location: "Berlin, Germany",
      },
      publisherOfTheWeek: {
        displayName: "Acme Press",
        slug: "acme-press",
        weekKey: spotlightWeekKey,
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
    expect(html).toContain(`/artist-of-the-week/${spotlightWeekKey}`);
    expect(html).toContain("Publisher of the week");
    expect(html).toContain("Acme Press");
    expect(html).toContain(`/publisher-of-the-week/${spotlightWeekKey}`);
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
    expect(html).toContain("/book-of-the-day/2026-05-31");
    expect(html).toContain("View book");
    expect(html).toContain('class="email-btn-primary"');
  });
});

describe("newsletter MJML template rendering", () => {
  it("renders the same core content as the hand-built HTML template", () => {
    const html = renderWeeklyBOTDNewsletterHtmlMjml({
      ...sampleNewsletterParams,
      items: [],
    });

    expect(html).toContain("Weekly BOTD");
    expect(html).toContain("Photobookers");
    expect(html).toContain("newsletter/logo.png");
    expect(html).toContain("Intro copy");
    expect(html).toContain("Outro copy");
    expect(html).toContain("Explore");
    expect(html).toContain("{$unsubscribe}");
    expect(html.match(/<!doctype html>/i)).not.toBeNull();
  });

  it("renders book cards and creator spotlights", () => {
    const spotlightWeekKey = toWeekString(
      toWeekStart(sampleNewsletterParams.weekEnd),
    );
    const html = renderWeeklyBOTDNewsletterHtmlMjml({
      ...sampleNewsletterParams,
      subject: "Weekly roundup",
      items: [
        {
          date: "2026-05-31",
          bookId: "id",
          bookSlug: "some-book",
          title: "Some Book",
          coverUrl: "https://example.com/cover.jpg",
          artistName: "Jane Artist",
          artistSlug: "jane-artist",
          publisherName: null,
          publisherSlug: null,
        },
      ],
      artistOfTheWeek: {
        displayName: "Jane Artist",
        slug: "jane-artist",
        weekKey: spotlightWeekKey,
        coverUrl: "https://example.com/artist.jpg",
        tagline: "Documentary photographer",
        location: "Berlin, Germany",
      },
      publisherOfTheWeek: null,
    });

    expect(html).toContain("May 31, 2026");
    expect(html).toContain("/book-of-the-day/2026-05-31");
    expect(html).toContain("Some Book");
    expect(html).toContain("View book");
    expect(html).toContain("Books of the day");
    expect(html).toContain("Artist of the week");
    expect(html).toContain("Documentary photographer");
    expect(html).toContain(`/artist-of-the-week/${spotlightWeekKey}`);
    expect(html).toContain("instagram.com/photobookers");
  });
});
