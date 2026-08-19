import { describe, expect, it } from "vitest";
import {
  liveActivityEventToStripItem,
  mergeRecentActivityItems,
  recentActivityTrailingText,
  shouldShowLiveActivityEvent,
  type RecentActivityItem,
} from "./homepageRecentActivityUtils";

const base = (
  overrides: Partial<RecentActivityItem> & Pick<RecentActivityItem, "id">,
): Omit<RecentActivityItem, "imageUrl"> & { imageUrl: string | null } => ({
  type: "book_favourited",
  targetName: "Example Book",
  targetUrl: "/books/example",
  createdAt: new Date("2026-08-20T12:00:00Z"),
  imageUrl: "https://cdn.example.com/cover.jpg",
  ...overrides,
});

describe("mergeRecentActivityItems", () => {
  it("sorts by createdAt descending and drops rows without images", () => {
    const merged = mergeRecentActivityItems([
      base({
        id: "old",
        createdAt: new Date("2026-08-18T12:00:00Z"),
      }),
      base({
        id: "new",
        createdAt: new Date("2026-08-20T12:00:00Z"),
      }),
      base({
        id: "no-image",
        imageUrl: "   ",
        createdAt: new Date("2026-08-21T12:00:00Z"),
      }),
    ]);

    expect(merged.map((item) => item.id)).toEqual(["new", "old"]);
    expect(merged.every((item) => item.imageUrl.length > 0)).toBe(true);
  });

  it("respects the limit", () => {
    const merged = mergeRecentActivityItems(
      [
        base({ id: "a", createdAt: new Date("2026-08-20T12:00:00Z") }),
        base({ id: "b", createdAt: new Date("2026-08-19T12:00:00Z") }),
        base({ id: "c", createdAt: new Date("2026-08-18T12:00:00Z") }),
      ],
      2,
    );

    expect(merged).toHaveLength(2);
    expect(merged[0]?.id).toBe("a");
    expect(merged[1]?.id).toBe("b");
  });
});

describe("recentActivityTrailingText", () => {
  it("returns copy for each activity type", () => {
    expect(recentActivityTrailingText("book_favourited")).toBe(
      " was added to favourites",
    );
    expect(recentActivityTrailingText("creator_followed")).toBe(
      " was followed",
    );
  });
});

describe("shouldShowLiveActivityEvent", () => {
  it("hides the current user's own actions and rows without images", () => {
    expect(
      shouldShowLiveActivityEvent(
        {
          actorId: "user-1",
          targetImageUrl: "https://cdn.example.com/cover.jpg",
          targetUrl: "/books/example",
        },
        "user-1",
      ),
    ).toBe(false);
    expect(
      shouldShowLiveActivityEvent(
        {
          actorId: "user-2",
          targetImageUrl: "https://cdn.example.com/cover.jpg",
          targetUrl: "/books/example",
        },
        "user-1",
      ),
    ).toBe(true);
    expect(
      shouldShowLiveActivityEvent({
        targetImageUrl: " ",
        targetUrl: "/books/example",
      }),
    ).toBe(false);
  });
});

describe("liveActivityEventToStripItem", () => {
  it("maps SSE payloads onto strip items", () => {
    expect(
      liveActivityEventToStripItem({
        id: "evt-1",
        type: "book_favourited",
        targetName: "Example Book",
        targetUrl: "/books/example",
        targetImageUrl: "https://cdn.example.com/cover.jpg",
        createdAt: "2026-08-20T12:00:00.000Z",
      }),
    ).toEqual({
      id: "evt-1",
      type: "book_favourited",
      targetName: "Example Book",
      targetUrl: "/books/example",
      imageUrl: "https://cdn.example.com/cover.jpg",
      createdAt: "2026-08-20T12:00:00.000Z",
    });
  });
});
