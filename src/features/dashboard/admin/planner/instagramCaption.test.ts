import { describe, expect, it } from "vitest";
import {
  buildArtistPostStickerText,
  buildBotdInstagramCaption,
  buildBotdPostStickerFields,
  buildBotdStoryHandles,
  buildBotdStoryStickerFields,
  buildDefaultArtistInstagramCaption,
  buildDefaultInstagramCaption,
  buildDefaultInstagramFirstComment,
  buildDefaultPublisherInstagramCaption,
  buildNewlyVerifiedCreatorInstagramCaption,
  buildPublisherPostStickerText,
  buildSpotlightStoryStickerText,
  collectBookImageOptions,
  collectCreatorImageOptions,
  ensureBookTagsInCaption,
  formatInstagramHandle,
  formatInstagramHashtags,
} from "./instagramCaption";
import {
  buildAotwInstagramDueAt,
  buildInstagramDueAt,
  buildPotwInstagramDueAt,
  extractBracketedFormFields,
  extractBracketedFormArrayFields,
  INSTAGRAM_SPOTLIGHT_AOTW_KEY,
  INSTAGRAM_SPOTLIGHT_POTW_KEY,
  isWeekInstagramFullyPrepared,
  parsePrepareInstagramForm,
  parsePrepareInstagramFormEntries,
  parseFeaturedHeroImagesForm,
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

  it("weaves spotlight blurb into default BOTD caption", () => {
    const caption = buildDefaultInstagramCaption(
      {
        title: "Winter Light",
        slug: "winter-light",
        artist: { displayName: "Jane Doe" },
      },
      { spotlightBlurb: "We love this quiet study of winter streets." },
    );

    expect(caption).toContain("We love this quiet study of winter streets.");
    expect(caption.indexOf("Winter Light")).toBeLessThan(
      caption.indexOf("We love this quiet study"),
    );
  });

  it("uses blurb-enhanced caption even when a stored caption exists", () => {
    const caption = buildBotdInstagramCaption(
      {
        title: "Winter Light",
        slug: "winter-light",
        artist: { displayName: "Jane Doe" },
      },
      "Book of the Day\n\nWinter Light\n\nOld manual copy.\n\nLink in bio →",
      "We are delighted to present this photobook.",
    );

    expect(caption).toContain("We are delighted to present this photobook.");
    expect(caption).not.toContain("Old manual copy.");
  });

  it("builds a newly verified creator caption", () => {
    const caption = buildNewlyVerifiedCreatorInstagramCaption({
      displayName: "Jane Doe",
      slug: "jane-doe",
      bio: "Documentary work from Berlin.",
    });

    expect(caption).toBe(
      [
        "New on photobookers",
        "",
        "We are delighted to welcome Jane Doe to photobookers.",
        "",
        "Documentary work from Berlin.",
        "",
        "Link in Bio",
      ].join("\n"),
    );
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

  it("collects creator cover and catalogue book covers", () => {
    const urls = collectCreatorImageOptions(
      { coverUrl: "https://example.com/creator.jpg" },
      [
        "https://example.com/book-a-cover.jpg",
        "https://example.com/book-a-page.jpg",
        "https://example.com/book-b-cover.jpg",
        "https://example.com/book-a-cover.jpg",
      ],
    );

    expect(urls).toEqual([
      "https://example.com/creator.jpg",
      "https://example.com/book-a-cover.jpg",
      "https://example.com/book-a-page.jpg",
      "https://example.com/book-b-cover.jpg",
    ]);
  });

  it("builds BOTD post sticker fields for feed notifications", () => {
    const book = {
      title: "Winter Light",
      slug: "winter-light",
      artist: {
        displayName: "Jane Doe",
        instagram: "@janedoe",
      },
      publisher: {
        displayName: "Acme Press",
        instagram: "acmepress",
      },
    };

    expect(buildBotdStoryHandles(book)).toBe("@janedoe\n@acmepress");
    expect(buildBotdPostStickerFields(book)).toEqual({
      text: [
        'Hi! Your book "Winter Light" was Book of the Day on photobookers.com.',
        "https://www.photobookers.com/books/winter-light",
        "",
        'Hi! "Winter Light" by Jane Doe was Book of the Day on photobookers.com.',
        "https://www.photobookers.com/books/winter-light",
      ].join("\n"),
      products: "@janedoe\n@acmepress",
    });
    expect(buildBotdStoryStickerFields(book)).toEqual({
      text: [
        'Hi! Your book "Winter Light" was Book of the Day on photobookers.com.',
        "https://www.photobookers.com/books/winter-light",
      ].join("\n"),
      topics: [
        'Hi! "Winter Light" by Jane Doe was Book of the Day on photobookers.com.',
        "https://www.photobookers.com/books/winter-light",
      ].join("\n"),
    });
  });

  it("fills BOTD story stickers when only artist or publisher is present", () => {
    expect(
      buildBotdStoryStickerFields({
        title: "Winter Light",
        slug: "winter-light",
        artist: { displayName: "Jane Doe", instagram: "@janedoe" },
      }),
    ).toEqual({
      text: [
        'Hi! Your book "Winter Light" was Book of the Day on photobookers.com.',
        "https://www.photobookers.com/books/winter-light",
      ].join("\n"),
    });

    expect(
      buildBotdStoryStickerFields({
        title: "Winter Light",
        slug: "winter-light",
        publisher: { displayName: "Acme Press", instagram: "acmepress" },
      }),
    ).toEqual({
      text: [
        'Hi! "Winter Light" by the artist was Book of the Day on photobookers.com.',
        "https://www.photobookers.com/books/winter-light",
      ].join("\n"),
    });
  });

  it("builds spotlight post sticker text and story mention block", () => {
    const creator = {
      displayName: "Jane Doe",
      slug: "jane-doe",
      instagram: "@janedoe",
    };

    expect(buildArtistPostStickerText(creator)).toBe(
      "Hi @janedoe! You were Artist of the Week on photobookers.com.\nhttps://www.photobookers.com/creators/jane-doe",
    );
    expect(buildPublisherPostStickerText(creator)).toBe(
      "Hi @janedoe! You were Publisher of the Week on photobookers.com.\nhttps://www.photobookers.com/creators/jane-doe",
    );
    expect(
      buildSpotlightStoryStickerText(
        "Artist of the Week\n\nJane Doe\n\nLink in bio →",
        [{ displayName: "Jane Doe", instagram: "@janedoe", role: "artist" }],
      ),
    ).toContain("@janedoe (artist) — Jane Doe");
  });
});

describe("instagram planner helpers", () => {
  it("parses prepare form entries", () => {
    const [error, entries] = parsePrepareInstagramFormEntries({
      week: "2026-W22",
      captions: { "2026-05-25": "Hello" },
      imageUrl: { "2026-05-25": ["https://example.com/cover.jpg"] },
    });

    expect(error).toBeNull();
    expect(entries).toHaveLength(1);
    expect(entries?.[0].caption).toBe("Hello");
    expect(entries?.[0].imageUrls).toEqual([
      "https://example.com/cover.jpg",
    ]);
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
        [INSTAGRAM_SPOTLIGHT_AOTW_KEY]: ["https://example.com/a.jpg"],
        [INSTAGRAM_SPOTLIGHT_POTW_KEY]: ["https://example.com/p.jpg"],
      },
    });

    expect(error).toBeNull();
    expect(payload?.botd).toHaveLength(0);
    expect(payload?.artist?.caption).toBe("Artist caption");
    expect(payload?.publisher?.caption).toBe("Publisher caption");
    expect(payload?.artist?.imageUrls).toEqual(["https://example.com/a.jpg"]);
  });

  it("parses carousel image arrays and caps at three", () => {
    const [error, payload] = parsePrepareInstagramForm({
      captions: { "2026-06-02": "Carousel caption" },
      imageUrl: {
        "2026-06-02": [
          "https://example.com/1.jpg",
          "https://example.com/2.jpg",
          "https://example.com/3.jpg",
          "https://example.com/4.jpg",
        ],
      },
    });

    expect(error).toBeNull();
    expect(payload?.botd[0]?.imageUrls).toEqual([
      "https://example.com/1.jpg",
      "https://example.com/2.jpg",
      "https://example.com/3.jpg",
    ]);
  });

  it("extracts bracketed array form fields from flat body keys", () => {
    const imageUrls = extractBracketedFormArrayFields(
      {
        "imageUrl[2026-06-02][]": [
          "https://example.com/1.jpg",
          "https://example.com/2.jpg",
        ],
      },
      "imageUrl",
    );

    expect(imageUrls).toEqual({
      "2026-06-02": [
        "https://example.com/1.jpg",
        "https://example.com/2.jpg",
      ],
    });
  });

  it("parses featured hero image form without captions", () => {
    const [error, payload] = parseFeaturedHeroImagesForm({
      imageUrl: {
        "2026-06-30": "https://example.com/botd.jpg",
        [INSTAGRAM_SPOTLIGHT_AOTW_KEY]: "https://example.com/a.jpg",
        [INSTAGRAM_SPOTLIGHT_POTW_KEY]: "https://example.com/p.jpg",
      },
    });

    expect(error).toBeNull();
    expect(payload?.botd).toHaveLength(1);
    expect(payload?.botd[0]?.imageUrl).toBe("https://example.com/botd.jpg");
    expect(payload?.artist?.imageUrl).toBe("https://example.com/a.jpg");
    expect(payload?.publisher?.imageUrl).toBe("https://example.com/p.jpg");
  });

  it("builds due at from configured post time", () => {
    const prev = process.env.BOTD_INSTAGRAM_POST_TIME;
    process.env.BOTD_INSTAGRAM_POST_TIME = "14:30";
    const dueAt = buildInstagramDueAt(new Date(Date.UTC(2026, 4, 25)));
    expect(dueAt.toISOString()).toBe("2026-05-25T14:30:00.000Z");
    process.env.BOTD_INSTAGRAM_POST_TIME = prev;
  });

  it("schedules spotlight feed posts on tuesday and monday", () => {
    const weekStart = new Date(Date.UTC(2026, 4, 18));
    const aotwDue = buildAotwInstagramDueAt(weekStart);
    const potwDue = buildPotwInstagramDueAt(weekStart);
    expect(aotwDue.getUTCDay()).toBe(2);
    expect(potwDue.getUTCDay()).toBe(1);
  });
});
