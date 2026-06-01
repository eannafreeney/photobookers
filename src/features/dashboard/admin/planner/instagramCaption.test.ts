import { describe, expect, it } from "vitest";
import {
  buildDefaultInstagramCaption,
  collectBookImageOptions,
} from "./instagramCaption";
import {
  buildInstagramDueAt,
  extractBracketedFormFields,
  isWeekInstagramFullyPrepared,
  parsePrepareInstagramFormEntries,
} from "./instagramUtils";
import { toDateString } from "../../../../lib/utils";
import { getWeekDays } from "./utils";

describe("instagram caption helpers", () => {
  it("builds a default caption with book link", () => {
    const caption = buildDefaultInstagramCaption({
      title: "Winter Light",
      slug: "winter-light",
      artist: { displayName: "Jane Doe" },
      publisher: { displayName: "Acme Press" },
    });

    expect(caption).toContain("Book of the Day: Winter Light");
    expect(caption).toContain("Jane Doe");
    expect(caption).toContain("Acme Press");
    expect(caption).toContain("/books/winter-light");
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

  it("builds due at from configured post time", () => {
    const prev = process.env.BOTD_INSTAGRAM_POST_TIME;
    process.env.BOTD_INSTAGRAM_POST_TIME = "14:30";
    const dueAt = buildInstagramDueAt(new Date(Date.UTC(2026, 4, 25)));
    expect(dueAt.toISOString()).toBe("2026-05-25T14:30:00.000Z");
    process.env.BOTD_INSTAGRAM_POST_TIME = prev;
  });
});
