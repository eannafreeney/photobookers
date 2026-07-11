import { describe, expect, it } from "vitest";
import { buildDailyProductDigestEmail } from "./emails";
import type { DailyProductDigestSnapshot } from "./types";

const snapshot: DailyProductDigestSnapshot = {
  range: {
    from: new Date("2026-07-10T00:00:00.000Z"),
    to: new Date("2026-07-10T00:00:00.000Z"),
  },
  growth: {
    newUsers: 12,
    verifiedCreators: 2,
    newBooks: 5,
    newFavorites: 34,
    newsletterSignups: 8,
    outboundClicks: 91,
  },
  topBooksByViews: [
    {
      title: "Coastal Light",
      slug: "coastal-light",
      viewCount: 120,
      artistName: "Jane Doe",
      publisherName: "Sea Press",
    },
  ],
  topArtistsByViews: [
    {
      displayName: "Jane Doe",
      slug: "jane-doe",
      type: "artist",
      viewCount: 45,
    },
  ],
  topPublishersByViews: [
    {
      displayName: "Sea Press",
      slug: "sea-press",
      type: "publisher",
      viewCount: 30,
    },
  ],
};

describe("buildDailyProductDigestEmail", () => {
  it("includes growth stats and top lists", () => {
    const html = buildDailyProductDigestEmail(snapshot);

    expect(html).toContain("New users");
    expect(html).toContain("12");
    expect(html).toContain("Coastal Light");
    expect(html).toContain("/books/coastal-light");
    expect(html).toContain("Jane Doe");
    expect(html).toContain("/creators/jane-doe");
    expect(html).toContain("Sea Press");
    expect(html).toContain("Outbound clicks");
    expect(html).toContain("91");
  });

  it("shows em dash when newsletter signups are unavailable", () => {
    const html = buildDailyProductDigestEmail({
      ...snapshot,
      growth: { ...snapshot.growth, newsletterSignups: null },
    });

    expect(html).toContain("Newsletter signups");
    expect(html).toContain("—");
  });
});
