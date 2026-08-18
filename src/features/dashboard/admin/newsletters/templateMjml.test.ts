import { describe, expect, it } from "vitest";
import { renderWeeklyBOTDNewsletterHtmlMjml } from "./utils/renderWeeklyBOTDNewsletterHtmlMjml";
import type { WeeklyNewsletterRenderParams } from "./types";

const minimalParams = (): WeeklyNewsletterRenderParams => ({
  weekStart: new Date("2026-07-20T00:00:00.000Z"),
  weekEnd: new Date("2026-07-26T00:00:00.000Z"),
  subject: "This week on photobookers",
  introText: "Hello from the MJML template.",
  outroText: "",
  ctaText: "Visit photobookers",
  ctaHref: "https://www.photobookers.com",
  botdEntries: [
    {
      date: "2026-07-20",
      bookId: "book-1",
      bookSlug: "example-book",
      title: "Example Book",
      coverUrl: "https://example.com/cover.jpg",
      blurb: "A short blurb.",
      artistName: "Ada Artist",
      artistSlug: "ada-artist",
      publisherName: "Press Co",
      publisherSlug: "press-co",
    },
  ],
  newMembers: [],
  upcomingFair: null,
  artistOfTheWeek: null,
  publisherOfTheWeek: null,
  trending: {
    books: [],
    artists: [
      {
        displayName: "Artist One",
        slug: "artist-one",
        type: "artist",
        coverUrl: "https://example.com/a1.jpg",
      },
      {
        displayName: "Artist Two",
        slug: "artist-two",
        type: "artist",
        coverUrl: "https://example.com/a2.jpg",
      },
      {
        displayName: "Artist Three",
        slug: "artist-three",
        type: "artist",
        coverUrl: "https://example.com/a3.jpg",
      },
    ],
    publishers: [],
  },
});

describe("renderWeeklyBOTDNewsletterHtmlMjml", () => {
  it("renders a basic weekly newsletter", () => {
    const html = renderWeeklyBOTDNewsletterHtmlMjml(minimalParams());

    expect(html).toContain("Photobookers Weekly");
    expect(html).toContain("This week on photobookers");
    expect(html).toContain("Example Book");
    expect(html).toContain("Books of the day");
    expect(html).toContain("Visit photobookers");
    expect(html).toContain("Top artists this week");
    expect(html).toContain("Artist One");
    expect(html).toContain("Artist Two");
    expect(html).toContain("Artist Three");
  });

  it("centers compact trending book titles like creator columns", () => {
    const html = renderWeeklyBOTDNewsletterHtmlMjml({
      ...minimalParams(),
      trending: {
        books: [
          {
            bookId: "trend-1",
            bookSlug: "trend-book",
            title: "Trending Title",
            coverUrl: "https://example.com/t.jpg",
            artistName: "Ada",
            publisherName: null,
          },
        ],
        artists: [],
        publishers: [],
      },
    });

    expect(html).toContain("Top books this week");
    const titleIdx = html.indexOf(">Trending Title<");
    expect(titleIdx).toBeGreaterThan(-1);
    const titleBlock = html.slice(Math.max(0, titleIdx - 350), titleIdx);
    expect(titleBlock).toContain("text-align:center");
    expect(titleBlock).not.toContain("-webkit-box");
  });
});
