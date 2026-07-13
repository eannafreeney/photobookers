import { describe, expect, it } from "vitest";
import { mergeFeedItems, type FeedBook, type FeedMessage } from "./followerFeed";

const book = (id: string, sortDate: Date): FeedBook => ({
  id,
  title: `Book ${id}`,
  slug: `book-${id}`,
  coverUrl: null,
  artistId: null,
  publisherId: null,
  releaseDate: sortDate,
  tags: [],
  createdByUserId: "user-1",
  createdAt: sortDate,
});

const message = (id: string, sortDate: Date): FeedMessage => ({
  id,
  creatorId: "creator-1",
  body: `Message ${id}`,
  imageUrl: null,
  notifyFollowersSentAt: null,
  createdAt: sortDate,
  updatedAt: null,
  creator: {
    id: "creator-1",
    displayName: "Creator",
    slug: "creator",
    coverUrl: null,
  },
});

describe("mergeFeedItems", () => {
  it("interleaves books and messages by date descending", () => {
    const items = mergeFeedItems(
      [book("b-old", new Date("2026-01-01")), book("b-new", new Date("2026-03-01"))],
      [
        message("m-mid", new Date("2026-02-01")),
        message("m-newest", new Date("2026-04-01")),
      ],
      1,
      10,
    );

    expect(items.map((item) => item.kind === "book" ? item.book.id : item.message.id)).toEqual([
      "m-newest",
      "b-new",
      "m-mid",
      "b-old",
    ]);
  });

  it("prefers messages over books on equal dates", () => {
    const same = new Date("2026-02-15");
    const items = mergeFeedItems(
      [book("b-1", same)],
      [message("m-1", same)],
      1,
      10,
    );

    expect(items[0]?.kind).toBe("message");
    expect(items[1]?.kind).toBe("book");
  });

  it("slices merged items for pagination", () => {
    const items = mergeFeedItems(
      [
        book("b-1", new Date("2026-04-01")),
        book("b-2", new Date("2026-02-01")),
      ],
      [message("m-1", new Date("2026-03-01"))],
      2,
      1,
    );

    expect(items).toHaveLength(1);
    expect(items[0]?.kind).toBe("message");
    expect(items[0]?.kind === "message" && items[0].message.id).toBe("m-1");
  });
});
