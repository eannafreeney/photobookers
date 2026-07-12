import { describe, expect, it } from "vitest";
import {
  buildTrendingBooksInstagramCaption,
  buildTrendingCreatorsInstagramCaption,
} from "./captions";
import {
  buildTrendingSlideOverlaySvg,
  escapeXml,
  truncateForSlide,
} from "./slideThemes";
import {
  buildTrendingInstagramDueAt,
  getCompletedNewsletterEditionRange,
  isTrendingInstagramRunDay,
} from "./schedule";

describe("escapeXml", () => {
  it("escapes markup characters", () => {
    expect(escapeXml(`Tom & "Jerry" <3`)).toBe(
      "Tom &amp; &quot;Jerry&quot; &lt;3",
    );
  });
});

describe("truncateForSlide", () => {
  it("truncates long titles with ellipsis", () => {
    const title = "A".repeat(60);
    expect(truncateForSlide(title, 52)).toHaveLength(52);
    expect(truncateForSlide(title, 52).endsWith("…")).toBe(true);
  });
});

describe("buildTrendingSlideOverlaySvg", () => {
  it("includes category, rank, and escaped title", () => {
    const svg = buildTrendingSlideOverlaySvg({
      kind: "books",
      rank: 1,
      title: 'Book & "Title"',
      subtitle: "Artist · Publisher",
    });

    expect(svg).toContain("Top books");
    expect(svg).toContain("#1");
    expect(svg).toContain("Book &amp; &quot;Title&quot;");
  });
});

describe("buildTrendingBooksInstagramCaption", () => {
  it("lists ranked books with credits", () => {
    const caption = buildTrendingBooksInstagramCaption([
      {
        bookId: "1",
        bookSlug: "alpha",
        title: "Alpha",
        coverUrl: null,
        artistName: "Artist One",
        publisherName: "Publisher One",
      },
    ]);

    expect(caption).toContain("Top books this week");
    expect(caption).toContain("1. Alpha — Artist One · Publisher One");
    expect(caption).not.toContain("Which one would you pick?");
    expect(caption).toContain("Link in bio →");
  });
});

describe("buildTrendingCreatorsInstagramCaption", () => {
  it("includes instagram handles when present", () => {
    const caption = buildTrendingCreatorsInstagramCaption("artists", [
      {
        displayName: "Artist One",
        slug: "artist-one",
        type: "artist",
        coverUrl: null,
        instagram: "https://instagram.com/artistone",
      },
    ]);

    expect(caption).toContain("Top artists this week");
    expect(caption).toContain("1. Artist One");
    expect(caption).toContain("@artistone");
  });
});

describe("getCompletedNewsletterEditionRange", () => {
  it("uses the most recent send Wednesday before Thursday", () => {
    const edition = getCompletedNewsletterEditionRange(
      new Date("2026-07-09T12:00:00.000Z"),
    );

    expect(edition.sendWednesday.toISOString()).toBe(
      "2026-07-08T00:00:00.000Z",
    );
    expect(edition.weekStart.toISOString()).toBe("2026-07-02T00:00:00.000Z");
    expect(edition.weekEnd.toISOString()).toBe("2026-07-08T00:00:00.000Z");
  });
});

describe("buildTrendingInstagramDueAt", () => {
  it("schedules books on Thursday after send Wednesday", () => {
    const sendWednesday = new Date("2026-07-08T00:00:00.000Z");
    const dueAt = buildTrendingInstagramDueAt(sendWednesday, "books");

    expect(dueAt.toISOString()).toBe("2026-07-09T14:00:00.000Z");
  });
});

describe("isTrendingInstagramRunDay", () => {
  it("is true on Thursday UTC", () => {
    expect(
      isTrendingInstagramRunDay(new Date("2026-07-09T12:00:00.000Z")),
    ).toBe(true);
    expect(
      isTrendingInstagramRunDay(new Date("2026-07-08T12:00:00.000Z")),
    ).toBe(false);
  });
});
