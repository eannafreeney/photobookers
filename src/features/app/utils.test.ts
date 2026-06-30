import { describe, expect, it, vi } from "vitest";

vi.mock("../../db/client", () => ({
  db: {},
}));

import { buildHeroCarouselItems } from "./utils";

describe("buildHeroCarouselItems", () => {
  it("prefers curated instagramImageUrl for spotlight slides", () => {
    const bookOfTheDay = {
      id: "botd-1",
      date: new Date("2026-06-30T00:00:00.000Z"),
      bookId: "book-1",
      instagramImageUrl: "https://example.com/curated-botd.jpg",
      book: {
        id: "book-1",
        title: "Test Book",
        slug: "test-book",
        coverUrl: "https://example.com/cover.jpg",
        artist: { displayName: "Jane Doe" },
        images: [{ imageUrl: "https://example.com/interior.jpg" }],
      },
    } as Parameters<typeof buildHeroCarouselItems>[0];

    const artistOfTheWeek = {
      id: "aotw-1",
      weekStart: new Date("2026-06-30T00:00:00.000Z"),
      creatorId: "artist-1",
      instagramImageUrl: "https://example.com/curated-artist.jpg",
      creator: {
        id: "artist-1",
        displayName: "Jane Doe",
        slug: "jane-doe",
        coverUrl: "https://example.com/artist-cover.jpg",
        country: "US",
      },
    } as Parameters<typeof buildHeroCarouselItems>[1];

    const publisherOfTheWeek = {
      id: "potw-1",
      weekStart: new Date("2026-06-30T00:00:00.000Z"),
      creatorId: "publisher-1",
      instagramImageUrl: "https://example.com/curated-publisher.jpg",
      creator: {
        id: "publisher-1",
        displayName: "Acme Press",
        slug: "acme-press",
        coverUrl: "https://example.com/publisher-cover.jpg",
        country: "UK",
      },
    } as Parameters<typeof buildHeroCarouselItems>[2];

    const items = buildHeroCarouselItems(
      bookOfTheDay,
      artistOfTheWeek,
      publisherOfTheWeek,
      ["https://example.com/stack-1.jpg", "https://example.com/stack-2.jpg"],
      ["https://example.com/pub-stack-1.jpg", "https://example.com/pub-stack-2.jpg"],
    );

    expect(items).toHaveLength(3);
    expect(items[0]?.image).toBe("https://example.com/curated-botd.jpg");
    expect(items[1]?.image).toBe("https://example.com/curated-artist.jpg");
    expect(items[1]?.coverStack).toEqual([]);
    expect(items[2]?.image).toBe("https://example.com/curated-publisher.jpg");
    expect(items[2]?.coverStack).toEqual([]);
  });
});
