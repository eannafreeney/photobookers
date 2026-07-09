import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateSpotlightBlurbForKey } from "./spotlightBlurb";

const rewriteSpotlightBlurbMock = vi.fn();
const findManyMock = vi.fn();

vi.mock("../../../../lib/openai", () => ({
  rewriteSpotlightBlurb: (...args: unknown[]) =>
    rewriteSpotlightBlurbMock(...args),
}));

vi.mock("../../../../db/client", () => ({
  db: {
    query: {
      books: {
        findMany: (...args: unknown[]) => findManyMock(...args),
      },
    },
  },
}));

describe("generateSpotlightBlurbForKey", () => {
  beforeEach(() => {
    rewriteSpotlightBlurbMock.mockReset();
    findManyMock.mockReset();
    rewriteSpotlightBlurbMock.mockResolvedValue("AI blurb");
    findManyMock.mockResolvedValue([
      { id: "book-1", description: "Original book description" },
    ]);
  });

  it("generates a BOTD blurb from the book description", async () => {
    const [error, blurb] = await generateSpotlightBlurbForKey(
      {
        botdEntries: [
          {
            date: new Date(Date.UTC(2026, 6, 13)),
            book: { id: "book-1", title: "Winter Light" },
          },
        ],
        artistOfTheWeek: null,
        publisherOfTheWeek: null,
        artistBookCoverUrls: [],
        publisherBookCoverUrls: [],
      } as never,
      "2026-07-13",
    );

    expect(error).toBeNull();
    expect(blurb).toBe("AI blurb");
    expect(rewriteSpotlightBlurbMock).toHaveBeenCalledWith({
      kind: "book",
      sourceText: "Original book description",
      title: "Winter Light",
    });
  });

  it("generates an AOTW blurb from creator source text", async () => {
    const [error, blurb] = await generateSpotlightBlurbForKey(
      {
        botdEntries: [],
        artistOfTheWeek: {
          creator: {
            displayName: "Jane Doe",
            tagline: "Quiet documentary photography.",
          },
        },
        publisherOfTheWeek: null,
        artistBookCoverUrls: [],
        publisherBookCoverUrls: [],
      } as never,
      "aotw",
    );

    expect(error).toBeNull();
    expect(blurb).toBe("AI blurb");
    expect(rewriteSpotlightBlurbMock).toHaveBeenCalledWith({
      kind: "artist",
      sourceText: "Quiet documentary photography.",
      title: "Jane Doe",
    });
  });
});
