import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  bufferCreateScheduledImagePost,
  bufferCreateScheduledStory,
  bufferPostExists,
} from "./buffer";

describe("bufferCreateScheduledImagePost", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env.BUFFER_ACCESS_TOKEN = "test-token";
    process.env.BUFFER_INSTAGRAM_CHANNEL_ID = "channel-123";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    delete process.env.BUFFER_ACCESS_TOKEN;
    delete process.env.BUFFER_INSTAGRAM_CHANNEL_ID;
  });

  it("schedules automatic Instagram feed posts with optional sticker fields", async () => {
    const fetchMock = vi.fn(async (_url, init) => {
      const body = JSON.parse(String(init?.body));
      expect(body.variables.input).toMatchObject({
        schedulingType: "automatic",
        mode: "customScheduled",
        dueAt: "2026-06-01T10:00:00.000Z",
      });
      expect(body.variables.input.metadata.instagram).toEqual({
        type: "post",
        shouldShareToFeed: true,
        firstComment: "https://www.photobookers.com/books/winter-light",
        stickerFields: {
          text: "Hi! Your book was Book of the Day.",
        },
      });

      return new Response(
        JSON.stringify({
          data: {
            createPost: {
              __typename: "PostActionSuccess",
              post: { id: "post-abc" },
            },
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    globalThis.fetch = fetchMock as typeof fetch;

    const [error, result] = await bufferCreateScheduledImagePost({
      text: "Book of the Day",
      imageUrl: "https://cdn.example.com/cover.jpg",
      dueAt: new Date("2026-06-01T10:00:00.000Z"),
      firstComment: "https://www.photobookers.com/books/winter-light",
      stickerFields: { text: "Hi! Your book was Book of the Day." },
    });

    expect(error).toBeNull();
    expect(result).toEqual({ postId: "post-abc" });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("surfaces Buffer mutation errors from the response body", async () => {
    globalThis.fetch = vi.fn(async () =>
      Response.json(
        {
          data: {
            createPost: {
              __typename: "InvalidInputError",
              message: "Image URL is not publicly accessible",
            },
          },
        },
        { status: 200 },
      ),
    ) as typeof fetch;

    const [error] = await bufferCreateScheduledImagePost({
      text: "caption",
      imageUrl: "https://cdn.example.com/cover.jpg",
      dueAt: new Date("2026-06-01T10:00:00.000Z"),
    });

    expect(error).toEqual({
      reason: "Image URL is not publicly accessible",
    });
  });

  it("includes non-JSON error bodies for HTTP failures", async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response("Bad Request: missing field", { status: 400 }),
    ) as typeof fetch;

    const [error] = await bufferCreateScheduledImagePost({
      text: "caption",
      imageUrl: "https://cdn.example.com/cover.jpg",
      dueAt: new Date("2026-06-01T10:00:00.000Z"),
    });

    expect(error?.reason).toContain("Buffer API error (400)");
    expect(error?.reason).toContain("Bad Request");
  });
});

describe("bufferPostExists", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env.BUFFER_ACCESS_TOKEN = "test-token";
    process.env.BUFFER_INSTAGRAM_CHANNEL_ID = "channel-123";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    delete process.env.BUFFER_ACCESS_TOKEN;
    delete process.env.BUFFER_INSTAGRAM_CHANNEL_ID;
  });

  it("returns false when Buffer reports the post was deleted", async () => {
    globalThis.fetch = vi.fn(async () =>
      Response.json({
        errors: [
          {
            message: "Post not found",
            extensions: { code: "NOT_FOUND" },
          },
        ],
        data: null,
      }),
    ) as typeof fetch;

    const [error, exists] = await bufferPostExists("deleted-post");

    expect(error).toBeNull();
    expect(exists).toBe(false);
  });

  it("returns true when Buffer returns the post", async () => {
    globalThis.fetch = vi.fn(async () =>
      Response.json({
        data: { post: { id: "post-abc" } },
      }),
    ) as typeof fetch;

    const [error, exists] = await bufferPostExists("post-abc");

    expect(error).toBeNull();
    expect(exists).toBe(true);
  });
});

describe("bufferCreateScheduledStory", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env.BUFFER_ACCESS_TOKEN = "test-token";
    process.env.BUFFER_INSTAGRAM_CHANNEL_ID = "channel-123";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    delete process.env.BUFFER_ACCESS_TOKEN;
    delete process.env.BUFFER_INSTAGRAM_CHANNEL_ID;
  });

  it("schedules notification-based Instagram stories with sticker text", async () => {
    const fetchMock = vi.fn(async (_url, init) => {
      const body = JSON.parse(String(init?.body));
      expect(body.variables.input).toMatchObject({
        text: "Book of the Day\n\nWinter Light\n\nLink in bio →",
        schedulingType: "notification",
        mode: "customScheduled",
        dueAt: "2026-06-01T10:00:00.000Z",
        assets: [{ image: { url: "https://cdn.example.com/cover.jpg" } }],
        metadata: {
          instagram: {
            type: "story",
            link: "https://www.photobookers.com/links",
            stickerFields: {
              text: "Book of the Day",
              music: "Winter Light",
              products: "@janedoe\n@acmepress",
            },
          },
        },
      });

      return new Response(
        JSON.stringify({
          data: {
            createPost: {
              __typename: "PostActionSuccess",
              post: { id: "story-abc" },
            },
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    globalThis.fetch = fetchMock as typeof fetch;

    const [error, result] = await bufferCreateScheduledStory({
      caption: "Book of the Day\n\nWinter Light\n\nLink in bio →",
      imageUrl: "https://cdn.example.com/cover.jpg",
      dueAt: new Date("2026-06-01T10:00:00.000Z"),
      stickerFields: {
        text: "Book of the Day",
        music: "Winter Light",
        products: "@janedoe\n@acmepress",
      },
      link: "https://www.photobookers.com/links",
    });

    expect(error).toBeNull();
    expect(result).toEqual({ postId: "story-abc" });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
