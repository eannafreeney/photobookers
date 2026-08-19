import { describe, expect, it } from "vitest";
import { parseHomepageRecentActivityConfig } from "./homepageRecentActivityUtils";

describe("parseHomepageRecentActivityConfig", () => {
  it("parses bootstrap JSON from a data attribute", () => {
    const raw = JSON.stringify({
      items: [
        {
          id: "a",
          type: "book_favourited",
          targetName: "Example",
          targetUrl: "/books/example",
          imageUrl: "https://cdn.example.com/cover.jpg",
          createdAt: "2026-08-20T12:00:00.000Z",
        },
      ],
      currentUserId: "user-1",
    });

    expect(parseHomepageRecentActivityConfig(raw)).toEqual({
      items: [
        {
          id: "a",
          type: "book_favourited",
          targetName: "Example",
          targetUrl: "/books/example",
          imageUrl: "https://cdn.example.com/cover.jpg",
          createdAt: "2026-08-20T12:00:00.000Z",
        },
      ],
      currentUserId: "user-1",
      hasMore: false,
      nextOffset: 1,
      pageSize: 10,
    });
  });

  it("returns empty config for invalid JSON", () => {
    expect(parseHomepageRecentActivityConfig("{bad")).toEqual({
      items: [],
      currentUserId: null,
      hasMore: false,
      nextOffset: 0,
      pageSize: 10,
    });
  });
});
