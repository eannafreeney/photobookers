import { describe, expect, it } from "vitest";
import {
  activityActorAvatarUrl,
  formatRecentActivityAge,
  formatActivityActorName,
  liveActivityEventToStripItem,
  mergeRecentActivityItems,
  recentActivityVerb,
  shouldShowLiveActivityEvent,
  type RecentActivityItem,
} from "./homepageRecentActivityUtils";

const base = (
  overrides: Partial<RecentActivityItem> & Pick<RecentActivityItem, "id">,
): Omit<RecentActivityItem, "imageUrl"> & { imageUrl: string | null } => ({
  type: "book_favourited",
  actorName: "Pat",
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

describe("formatActivityActorName", () => {
  it("prefers creator display name, then first and last name", () => {
    expect(
      formatActivityActorName({
        firstName: "Oliver",
        lastName: "Burgold",
        creatorDisplayName: "OliverBurgold",
      }),
    ).toBe("OliverBurgold");
    expect(
      formatActivityActorName({ firstName: "Oliver", lastName: "Burgold" }),
    ).toBe("Oliver Burgold");
    expect(formatActivityActorName({})).toBe("Someone");
  });
});

describe("recentActivityVerb", () => {
  it("returns copy for each activity type", () => {
    expect(recentActivityVerb("book_commented")).toBe("commented on");
    expect(recentActivityVerb("book_favourited")).toBe("favourited");
    expect(recentActivityVerb("book_collected")).toBe("collected");
    expect(recentActivityVerb("creator_followed")).toBe("followed");
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

describe("formatRecentActivityAge", () => {
  const now = new Date("2026-08-20T12:00:30.000Z").getTime();

  it("collapses the first few seconds to Just now", () => {
    expect(formatRecentActivityAge("2026-08-20T12:00:30.000Z", now)).toBe(
      "Just now",
    );
    expect(formatRecentActivityAge("2026-08-20T12:00:21.000Z", now)).toBe(
      "Just now",
    );
    expect(formatRecentActivityAge("2026-08-20T12:00:19.000Z", now)).toBe(
      "11 seconds ago",
    );
  });

  it("formats seconds and minutes", () => {
    expect(formatRecentActivityAge("2026-08-20T12:00:00.000Z", now)).toBe(
      "30 seconds ago",
    );
    expect(formatRecentActivityAge("2026-08-20T11:59:00.000Z", now)).toBe(
      "1 minute ago",
    );
    expect(formatRecentActivityAge("2026-08-20T11:57:30.000Z", now)).toBe(
      "3 minutes ago",
    );
  });
});

describe("liveActivityEventToStripItem", () => {
  it("maps SSE payloads onto strip items", () => {
    expect(
      liveActivityEventToStripItem({
        id: "evt-1",
        type: "book_favourited",
        actorName: "Pat",
        targetName: "Example Book",
        targetUrl: "/books/example",
        targetImageUrl: "https://cdn.example.com/cover.jpg",
        createdAt: "2026-08-20T12:00:00.000Z",
      }),
    ).toEqual({
      id: "evt-1",
      type: "book_favourited",
      actorName: "Pat",
      actorImageUrl: null,
      targetName: "Example Book",
      targetUrl: "/books/example",
      imageUrl: "https://cdn.example.com/cover.jpg",
      createdAt: "2026-08-20T12:00:00.000Z",
    });
  });

  it("carries the actor avatar through", () => {
    expect(
      liveActivityEventToStripItem({
        id: "evt-2",
        type: "creator_followed",
        actorName: "Pat",
        actorImageUrl: "https://cdn.example.com/pat.jpg",
        targetName: "Acme Press",
        targetUrl: "/creators/acme-press",
        targetImageUrl: "https://cdn.example.com/acme.jpg",
        createdAt: "2026-08-20T12:00:00.000Z",
      })?.actorImageUrl,
    ).toBe("https://cdn.example.com/pat.jpg");
  });
});

describe("activityActorAvatarUrl", () => {
  it("prefers the actor's own image", () => {
    expect(
      activityActorAvatarUrl({
        actorName: "Pat Doe",
        actorImageUrl: "https://cdn.example.com/pat.jpg",
      }),
    ).toBe("https://cdn.example.com/pat.jpg");
  });

  it("falls back to an initials avatar built from the actor name", () => {
    const url = activityActorAvatarUrl({
      actorName: "Pat Doe",
      actorImageUrl: null,
    });

    expect(url.startsWith("data:image/svg+xml,")).toBe(true);
    expect(decodeURIComponent(url)).toMatch(/<text[^>]*>\s*PD\s*<\/text>/);
  });
});
