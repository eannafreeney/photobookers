import { describe, expect, it, vi } from "vitest";

vi.mock("../../db/client", () => ({
  db: {},
}));

import {
  buildCreatorOfTheWeekSpotlight,
  type ArtistOfTheWeekData,
  type PublisherOfTheWeekData,
} from "./utils";

const artistOfTheWeek = {
  id: "aotw-1",
  weekStart: new Date("2026-06-29T00:00:00.000Z"),
  creatorId: "artist-1",
  featuredImageUrl: "https://example.com/curated-artist.jpg",
  creator: {
    id: "artist-1",
    displayName: "Jane Doe",
    slug: "jane-doe",
    coverUrl: "https://example.com/artist-cover.jpg",
    country: "US",
  },
} as ArtistOfTheWeekData;

const publisherOfTheWeek = {
  id: "potw-1",
  weekStart: new Date("2026-06-29T00:00:00.000Z"),
  creatorId: "publisher-1",
  featuredImageUrl: null,
  creator: {
    id: "publisher-1",
    displayName: "Acme Press",
    slug: "acme-press",
    coverUrl: "https://example.com/publisher-cover.jpg",
    country: null,
  },
} as PublisherOfTheWeekData;

describe("buildCreatorOfTheWeekSpotlight", () => {
  it("links an artist pick at its week", () => {
    const spotlight = buildCreatorOfTheWeekSpotlight("artist", artistOfTheWeek, [
      "https://example.com/cover-1.jpg",
    ]);

    expect(spotlight).toEqual({
      role: "artist",
      creator: {
        id: "artist-1",
        displayName: "Jane Doe",
        slug: "jane-doe",
        coverUrl: "https://example.com/artist-cover.jpg",
        country: "US",
      },
      featuredImageUrl: "https://example.com/curated-artist.jpg",
      coverStack: ["https://example.com/cover-1.jpg"],
      link: "/artist-of-the-week/2026-W27",
    });
  });

  it("links a publisher pick at its own route and tolerates missing fields", () => {
    const spotlight = buildCreatorOfTheWeekSpotlight(
      "publisher",
      publisherOfTheWeek,
      [],
    );

    expect(spotlight?.link).toBe("/publisher-of-the-week/2026-W27");
    expect(spotlight?.featuredImageUrl).toBeNull();
    expect(spotlight?.creator.country).toBeNull();
  });

  it("returns null when there is no pick this week", () => {
    expect(buildCreatorOfTheWeekSpotlight("artist", null, [])).toBeNull();
  });
});
