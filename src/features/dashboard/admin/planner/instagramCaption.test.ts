import { describe, expect, it } from "vitest";
import {
  buildBotdInstagramCaption,
  buildDefaultArtistInstagramCaption,
  buildDefaultInstagramCaption,
  buildDefaultInstagramFirstComment,
  buildDefaultPublisherInstagramCaption,
  buildStoryStickerText,
  collectBookImageOptions,
  ensureBookTagsInCaption,
  formatInstagramHandle,
  formatInstagramHashtags,
} from "./instagramCaption";
import {
  buildAotwInstagramDueAt,
  buildInstagramDueAt,
  buildPotwInstagramDueAt,
  extractBracketedFormFields,
  INSTAGRAM_SPOTLIGHT_AOTW_KEY,
  INSTAGRAM_SPOTLIGHT_POTW_KEY,
  isWeekInstagramFullyPrepared,
  parsePrepareInstagramForm,
  parsePrepareInstagramFormEntries,
} from "./instagramUtils";
import { toDateString } from "../../../../lib/utils";
import { getWeekDays } from "./utils";

describe("instagram caption helpers", () => {
  it("builds a default caption with instagram handles when available", () => {
    const caption = buildDefaultInstagramCaption({
      title: "Winter Light",
      slug: "winter-light",
      artist: {
        displayName: "Jane Doe",
        instagram: "https://instagram.com/janedoe",
      },
      publisher: { displayName: "Acme Press", instagram: "@acmepress" },
    });

    expect(caption).toContain("Book of the Day");
    expect(caption).toContain("Winter Light");
    expect(caption).toContain("by Jane Doe");
    expect(caption).toContain("@janedoe");
    expect(caption).toContain("@acmepress");
    expect(caption).toContain("Link in bio");
  });

  it("formats multi-word tags as single hashtags", () => {
    expect(formatInstagramHashtags(["still life", "urban"])).toBe(
      "#stilllife #urban",
    );
  });

  it("includes book tags as hashtags", () => {
    const caption = buildDefaultInstagramCaption({
      title: "Winter Light",
      slug: "winter-light",
      tags: ["urban", "street"],
    });

    expect(caption).toContain("#urban");
    expect(caption).toContain("#street");
  });

  it("adds missing tags to a stored caption", () => {
    const merged = ensureBookTagsInCaption(
      "Book of the Day: Winter Light\n\nLink in bio →",
      ["urban"],
    );
    expect(merged).toContain("#urban");
    expect(merged.indexOf("#urban")).toBeLessThan(merged.indexOf("Link in bio"));
  });

  it("builds botd caption from stored text with tags merged in", () => {
    const caption = buildBotdInstagramCaption(
      { title: "Winter Light", slug: "winter-light", tags: ["urban"] },
      "Book of the Day: Winter Light",
    );
    expect(caption).toContain("#urban");
  });

  it("builds artist and publisher spotlight captions", () => {
    const artist = buildDefaultArtistInstagramCaption({
      displayName: "Jane Doe",
      slug: "jane-doe",
      bio: "Photographer based in NYC.",
      instagram: "@janedoe",
    });
    expect(artist).toContain("Artist of the Week");
    expect(artist).toContain("Jane Doe");
    expect(artist).toContain("@janedoe");

    const publisher = buildDefaultPublisherInstagramCaption({
      displayName: "Acme Press",
      slug: "acme-press",
    });
    expect(publisher).toContain("Publisher of the Week");
    expect(publisher).toContain("Acme Press");
  });

  it("falls back to display names without instagram handles", () => {
    const caption = buildDefaultInstagramCaption({
      title: "Winter Light",
      slug: "winter-light",
      artist: { displayName: "Jane Doe" },
      publisher: { displayName: "Acme Press" },
    });

    expect(caption).toContain("Jane Doe");
    expect(caption).toContain("Published by Acme Press");
    expect(caption).toContain("#photobook");
  });

  it("normalizes instagram urls and handles", () => {
    expect(formatInstagramHandle("https://instagram.com/foo_bar/")).toBe(
      "@foo_bar",
    );
    expect(formatInstagramHandle("@baz")).toBe("@baz");
    expect(formatInstagramHandle("  ")).toBeNull();
  });

  it("builds first comment with book page url", () => {
    expect(
      buildDefaultInstagramFirstComment({ slug: "winter-light" }),
    ).toContain("/books/winter-light");
  });

  it("collects cover and gallery image urls", () => {
    const urls = collectBookImageOptions({
      coverUrl: "https://example.com/cover.jpg",
      images: [{ imageUrl: "https://example.com/page1.jpg" }],
    });

    expect(urls).toEqual([
      "https://example.com/cover.jpg",
      "https://example.com/page1.jpg",
    ]);
  });

  it("adds a mention block before link in bio for story stickers", () => {
    const stickerText = buildStoryStickerText(
      "Book of the Day\n\nWinter Light\n\nLink in bio →",
      [
        {
          displayName: "Jane Doe",
          instagram: "@janedoe",
          role: "artist",
        },
        {
          displayName: "Acme Press",
          instagram: "acmepress",
          role: "publisher",
        },
      ],
    );

    expect(stickerText).toContain("Mention:");
    expect(stickerText).toContain("@janedoe (artist) — Jane Doe");
    expect(stickerText).toContain("@acmepress (publisher) — Acme Press");
    expect(stickerText.indexOf("Mention:")).toBeLessThan(
      stickerText.indexOf("Link in bio"),
    );
  });

  it("omits mention block when no handles are available", () => {
    const caption = "Artist of the Week\n\nLink in bio →";
    expect(
      buildStoryStickerText(caption, [{ displayName: "Jane Doe" }]),
    ).toBe(caption);
  });
});

describe("instagram planner helpers", () => {
  it("parses prepare form entries", () => {
    const [error, entries] = parsePrepareInstagramFormEntries({
      week: "2026-W22",
      captions: { "2026-05-25": "Hello" },
      imageUrl: { "2026-05-25": "https://example.com/cover.jpg" },
    });

    expect(error).toBeNull();
    expect(entries).toHaveLength(1);
    expect(entries?.[0].caption).toBe("Hello");
  });

  it("extracts bracketed form fields from flat body keys", () => {
    const captions = extractBracketedFormFields(
      {
        week: "2026-W23",
        "captions[2026-06-02]": "Hello from flat body",
        "imageUrl[2026-06-02]": "https://example.com/cover.jpg",
      },
      "captions",
    );

    expect(captions).toEqual({ "2026-06-02": "Hello from flat body" });
  });

  it("marks week prepared only when every scheduled day is prepared", () => {
    const weekStart = new Date(Date.UTC(2026, 4, 18));
    const days = getWeekDays(weekStart);
    const byDate = new Map([
      [toDateString(days[0]), { instagramPreparedAt: new Date() }],
      [toDateString(days[1]), { instagramPreparedAt: null }],
    ]);

    expect(isWeekInstagramFullyPrepared(weekStart, byDate)).toBe(false);
  });

  it("requires artist and publisher prep when scheduled for the week", () => {
    const weekStart = new Date(Date.UTC(2026, 4, 18));
    const days = getWeekDays(weekStart);
    const byDate = new Map([
      [toDateString(days[0]), { instagramPreparedAt: new Date() }],
    ]);

    expect(
      isWeekInstagramFullyPrepared(weekStart, byDate, {
        artistOfTheWeek: { instagramPreparedAt: null },
      }),
    ).toBe(false);

    expect(
      isWeekInstagramFullyPrepared(weekStart, byDate, {
        artistOfTheWeek: { instagramPreparedAt: new Date() },
        publisherOfTheWeek: { instagramPreparedAt: new Date() },
      }),
    ).toBe(true);
  });

  it("parses spotlight form keys", () => {
    const [error, payload] = parsePrepareInstagramForm({
      captions: {
        [INSTAGRAM_SPOTLIGHT_AOTW_KEY]: "Artist caption",
        [INSTAGRAM_SPOTLIGHT_POTW_KEY]: "Publisher caption",
      },
      imageUrl: {
        [INSTAGRAM_SPOTLIGHT_AOTW_KEY]: "https://example.com/a.jpg",
        [INSTAGRAM_SPOTLIGHT_POTW_KEY]: "https://example.com/p.jpg",
      },
    });

    expect(error).toBeNull();
    expect(payload?.botd).toHaveLength(0);
    expect(payload?.artist?.caption).toBe("Artist caption");
    expect(payload?.publisher?.caption).toBe("Publisher caption");
  });

  it("builds due at from configured post time", () => {
    const prev = process.env.BOTD_INSTAGRAM_POST_TIME;
    process.env.BOTD_INSTAGRAM_POST_TIME = "14:30";
    const dueAt = buildInstagramDueAt(new Date(Date.UTC(2026, 4, 25)));
    expect(dueAt.toISOString()).toBe("2026-05-25T14:30:00.000Z");
    process.env.BOTD_INSTAGRAM_POST_TIME = prev;
  });

  it("schedules spotlight posts on saturday and sunday", () => {
    const weekStart = new Date(Date.UTC(2026, 4, 18));
    const aotwDue = buildAotwInstagramDueAt(weekStart);
    const potwDue = buildPotwInstagramDueAt(weekStart);
    expect(aotwDue.getUTCDay()).toBe(6);
    expect(potwDue.getUTCDay()).toBe(0);
  });
});
