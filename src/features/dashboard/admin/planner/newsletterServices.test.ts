import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WeeklyNewsletterBookItem } from "./newsletterTemplate";
import type { WeeklyNewsletterNewMember } from "./newsletterTemplate";

const {
  creatorsFindManyMock,
  artistOfTheWeekFindFirstMock,
  publisherOfTheWeekFindFirstMock,
  bookFairsFindFirstMock,
  getBooksOfTheDayInRangeMock,
  getTopBooksByViewsMock,
  getTopCreatorsByViewsMock,
} = vi.hoisted(() => ({
  creatorsFindManyMock: vi.fn(),
  artistOfTheWeekFindFirstMock: vi.fn(),
  publisherOfTheWeekFindFirstMock: vi.fn(),
  bookFairsFindFirstMock: vi.fn(),
  getBooksOfTheDayInRangeMock: vi.fn(),
  getTopBooksByViewsMock: vi.fn(),
  getTopCreatorsByViewsMock: vi.fn(),
}));

vi.mock("../../../../db/client", () => ({
  db: {
    query: {
      creators: {
        findMany: creatorsFindManyMock,
      },
      artistOfTheWeek: {
        findFirst: artistOfTheWeekFindFirstMock,
      },
      publisherOfTheWeek: {
        findFirst: publisherOfTheWeekFindFirstMock,
      },
      bookFairs: {
        findFirst: bookFairsFindFirstMock,
      },
      newsletterCampaigns: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../../app/BOTDServices", () => ({
  getBooksOfTheDayInRange: getBooksOfTheDayInRangeMock,
}));

vi.mock("../../../book-views/services", () => ({
  getTopBooksByViews: getTopBooksByViewsMock,
}));

vi.mock("../../../creator-views/services", () => ({
  getTopCreatorsByViews: getTopCreatorsByViewsMock,
}));

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
import { renderWeeklyBOTDNewsletterHtmlMjml } from "./newsletterTemplateMjml";
import { buildWeeklyBOTDGeneratedContent as buildGeneratedContent } from "./newsletterServices";

const sampleNewsletterParams = {
  weekStart: new Date(Date.UTC(2026, 4, 18)),
  weekEnd: new Date(Date.UTC(2026, 4, 24)),
  subject: "Weekly BOTD",
  introText: "Intro copy",
  outroText: "Outro copy",
  ctaText: "Explore",
  items: [] as WeeklyNewsletterBookItem[],
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
    expect(label).toBe("18th May 2026 to 24th May 2026");
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

describe("buildWeeklyBOTDGeneratedContent", () => {
  beforeEach(() => {
    creatorsFindManyMock.mockReset();
    artistOfTheWeekFindFirstMock.mockReset();
    publisherOfTheWeekFindFirstMock.mockReset();
    bookFairsFindFirstMock.mockReset();
    getBooksOfTheDayInRangeMock.mockReset();
    getTopBooksByViewsMock.mockReset();
    getTopCreatorsByViewsMock.mockReset();

    getBooksOfTheDayInRangeMock.mockResolvedValue([
      null,
      {
        botdEntries: [],
      },
    ]);
    getTopBooksByViewsMock.mockResolvedValue([null, { books: [] }]);
    getTopCreatorsByViewsMock.mockResolvedValue([null, { creators: [] }]);
    artistOfTheWeekFindFirstMock.mockResolvedValue(null);
    publisherOfTheWeekFindFirstMock.mockResolvedValue(null);
    bookFairsFindFirstMock.mockResolvedValue(null);
  });

  it("only includes newly verified creators with published books", async () => {
    creatorsFindManyMock.mockResolvedValue([
      {
        displayName: "No Books Yet",
        slug: "no-books-yet",
        type: "artist",
        coverUrl: null,
        tagline: "Soon",
        city: "Paris",
        country: "France",
        booksAsArtist: [],
        booksAsPublisher: [],
      },
      {
        displayName: "Published Artist",
        slug: "published-artist",
        type: "artist",
        coverUrl: null,
        tagline: "Documentary",
        city: "Berlin",
        country: "Germany",
        booksAsArtist: [{ id: "book-1" }],
        booksAsPublisher: [],
      },
      {
        displayName: "Published Publisher",
        slug: "published-publisher",
        type: "publisher",
        coverUrl: null,
        tagline: "Independent press",
        city: "London",
        country: "UK",
        booksAsArtist: [],
        booksAsPublisher: [{ id: "book-2" }],
      },
    ]);

    const [error, generated] = await buildGeneratedContent(
      new Date(Date.UTC(2026, 4, 28)),
      new Date(Date.UTC(2026, 5, 3)),
    );

    expect(error).toBeNull();
    expect(generated?.newMembers).toEqual<WeeklyNewsletterNewMember[]>([
      {
        displayName: "Published Artist",
        slug: "published-artist",
        type: "artist",
        coverUrl: null,
        tagline: "Documentary",
        location: "Berlin, Germany",
      },
      {
        displayName: "Published Publisher",
        slug: "published-publisher",
        type: "publisher",
        coverUrl: null,
        tagline: "Independent press",
        location: "London, UK",
      },
    ]);
    expect(creatorsFindManyMock).toHaveBeenCalledOnce();
  });

  it("includes top trending books, artists, and publishers for the edition", async () => {
    creatorsFindManyMock.mockResolvedValue([]);
    getTopBooksByViewsMock.mockResolvedValue([
      null,
      {
        books: [
          {
            bookId: "book-1",
            slug: "winter-light",
            title: "Winter Light",
            coverUrl: "https://example.com/winter.jpg",
            viewCount: 42,
            artistName: "Jane Artist",
            publisherName: "Acme Press",
          },
        ],
      },
    ]);
    getTopCreatorsByViewsMock
      .mockResolvedValueOnce([
        null,
        {
          creators: [
            {
              creatorId: "artist-1",
              displayName: "Jane Artist",
              slug: "jane-artist",
              coverUrl: "https://example.com/jane.jpg",
              type: "artist",
              viewCount: 10,
            },
          ],
        },
      ])
      .mockResolvedValueOnce([
        null,
        {
          creators: [
            {
              creatorId: "pub-1",
              displayName: "Acme Press",
              slug: "acme-press",
              coverUrl: null,
              type: "publisher",
              viewCount: 8,
            },
          ],
        },
      ]);

    const [error, generated] = await buildGeneratedContent(
      new Date(Date.UTC(2026, 4, 28)),
      new Date(Date.UTC(2026, 5, 3)),
    );

    expect(error).toBeNull();
    expect(generated?.trending).toEqual({
      books: [
        {
          bookId: "book-1",
          bookSlug: "winter-light",
          title: "Winter Light",
          coverUrl: "https://example.com/winter.jpg",
          artistName: "Jane Artist",
          publisherName: "Acme Press",
        },
      ],
      artists: [
        {
          displayName: "Jane Artist",
          slug: "jane-artist",
          type: "artist",
          coverUrl: "https://example.com/jane.jpg",
        },
      ],
      publishers: [
        {
          displayName: "Acme Press",
          slug: "acme-press",
          type: "publisher",
          coverUrl: null,
        },
      ],
    });
    expect(getTopBooksByViewsMock).toHaveBeenCalledWith(
      {
        from: new Date(Date.UTC(2026, 4, 28)),
        to: new Date(Date.UTC(2026, 5, 3)),
      },
      1,
      3,
    );
  });

  it("includes the next week's upcoming fair when one is scheduled", async () => {
    creatorsFindManyMock.mockResolvedValue([]);
    bookFairsFindFirstMock.mockResolvedValue({
      name: "Tokyo Art Book Fair",
      slug: "tokyo-art-book-fair",
      coverUrl: "https://example.com/fair.jpg",
      venue: "Museum Hall",
      city: "Tokyo",
      country: "Japan",
      startDate: new Date(Date.UTC(2026, 5, 4)),
      endDate: new Date(Date.UTC(2026, 5, 6)),
    });

    const [error, generated] = await buildGeneratedContent(
      new Date(Date.UTC(2026, 4, 28)),
      new Date(Date.UTC(2026, 5, 3)),
    );

    expect(error).toBeNull();
    expect(generated?.upcomingFair).toEqual({
      name: "Tokyo Art Book Fair",
      slug: "tokyo-art-book-fair",
      coverUrl: "https://example.com/fair.jpg",
      venue: "Museum Hall",
      location: "Tokyo, Japan",
      startDate: "2026-06-04",
      endDate: "2026-06-06",
    });
  });
});

describe("newsletter template rendering", () => {
  it("renders core newsletter content", () => {
    const html = renderWeeklyBOTDNewsletterHtmlMjml({
      ...sampleNewsletterParams,
      items: [],
    });

    expect(html).toContain("Weekly BOTD");
    expect(html).toContain("Photobookers");
    expect(html).toContain("newsletter/logo.png");
    expect(html).toContain("Outro copy");
    expect(html).toContain("Explore");
    expect(html).toContain("Download iOS App");
    expect(html).toContain("apps.apple.com/us/app/photobookers/id6771879476");
    expect(html).toContain("{$unsubscribe}");
    expect(html.match(/<!doctype html>/i)).not.toBeNull();
  });

  it("renders newly verified creators", () => {
    const html = renderWeeklyBOTDNewsletterHtmlMjml({
      ...sampleNewsletterParams,
      subject: "Weekly roundup",
      newMembers: [
        {
          displayName: "Sam Photographer",
          slug: "sam-photographer",
          type: "artist",
          coverUrl: "https://example.com/sam.jpg",
          tagline: "Street photography",
          location: "Tokyo, Japan",
        },
      ],
    });

    expect(html).toContain("New on Photobookers");
    expect(html).toContain("Sam Photographer");
    expect(html).toContain("Street photography");
    expect(html).toContain("/creators/sam-photographer");
    expect(html).toContain("View profile");
  });

  it("renders the upcoming fair section", () => {
    const html = renderWeeklyBOTDNewsletterHtmlMjml({
      ...sampleNewsletterParams,
      subject: "Weekly roundup",
      upcomingFair: {
        name: "Tokyo Art Book Fair",
        slug: "tokyo-art-book-fair",
        coverUrl: "https://example.com/fair.jpg",
        venue: "Museum Hall",
        location: "Tokyo, Japan",
        startDate: "2026-06-04",
        endDate: "2026-06-06",
      },
    });

    expect(html).toContain("Next week fair");
    expect(html).toContain("Tokyo Art Book Fair");
    expect(html).toContain("Jun 4-6, 2026");
    expect(html).toContain("Museum Hall");
    expect(html).toContain("Tokyo, Japan");
    expect(html).toContain("/fairs/tokyo-art-book-fair");
    expect(html).toContain("View fair");
  });

  it("renders artist and publisher of the week spotlights", () => {
    const weekEnd = new Date(Date.UTC(2026, 4, 24));
    const spotlightWeekKey = toWeekString(toWeekStart(weekEnd));
    const html = renderWeeklyBOTDNewsletterHtmlMjml({
      ...sampleNewsletterParams,
      subject: "Weekly roundup",
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
    expect(html).toContain("View profile");
    expect(html).toContain("Jane Artist");
    expect(html).toContain(`/artist-of-the-week/${spotlightWeekKey}`);
    expect(html).toContain("Publisher of the week");
    expect(html).toContain("Acme Press");
    expect(html).toContain(`/publisher-of-the-week/${spotlightWeekKey}`);
  });

  it("renders book cards with formatted dates", () => {
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

  it("renders trending books, artists, and publishers", () => {
    const html = renderWeeklyBOTDNewsletterHtmlMjml({
      ...sampleNewsletterParams,
      subject: "Weekly roundup",
      trending: {
        books: [
          {
            bookId: "book-1",
            bookSlug: "winter-light",
            title: "Winter Light",
            coverUrl: "https://example.com/winter.jpg",
            artistName: "Jane Artist",
            publisherName: "Acme Press",
          },
        ],
        artists: [
          {
            displayName: "Jane Artist",
            slug: "jane-artist",
            type: "artist",
            coverUrl: "https://example.com/jane.jpg",
          },
        ],
        publishers: [
          {
            displayName: "Acme Press",
            slug: "acme-press",
            type: "publisher",
            coverUrl: null,
          },
        ],
      },
    });

    expect(html).toContain("Top books this week");
    expect(html).toContain("Winter Light");
    expect(html).toContain("/books/winter-light");
    expect(html).toContain("Top artists this week");
    expect(html).toContain("/creators/jane-artist");
    expect(html).toContain("Top publishers this week");
    expect(html).toContain("/creators/acme-press");
  });
});
