import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bufferCreateScheduledImagePost } from "./buffer";

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

  it("sends required Instagram metadata and returns post id on success", async () => {
    const fetchMock = vi.fn(async (_url, init) => {
      const body = JSON.parse(String(init?.body));
      expect(body.variables.input.metadata.instagram).toEqual({
        type: "post",
        shouldShareToFeed: true,
        firstComment: "https://www.photobookers.com/books/winter-light",
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
