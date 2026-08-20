import { describe, expect, it } from "vitest";
import {
  bookLiveInstagramCaption,
  nativeSharePayload,
  shouldUseRichNativeShare,
} from "./share";

describe("nativeSharePayload", () => {
  it("puts the URL on its own last line and omits a separate url field", () => {
    const payload = nativeSharePayload(
      "Favourite Books of 2026 · Oliver Burgold",
      "Check out Favourite Books of 2026 by Oliver Burgold on Photobookers",
      "https://www.photobookers.com/shelf/oliver-burgold/lists/favourite-books-of-2026",
    );

    expect(payload).toEqual({
      title: "Favourite Books of 2026 · Oliver Burgold",
      text: "Check out Favourite Books of 2026 by Oliver Burgold on Photobookers\nhttps://www.photobookers.com/shelf/oliver-burgold/lists/favourite-books-of-2026",
    });
    expect(payload).not.toHaveProperty("url");
  });
});

describe("shouldUseRichNativeShare", () => {
  it("follows userAgentData.mobile when present", () => {
    expect(shouldUseRichNativeShare({ mobile: true })).toBe(true);
    expect(shouldUseRichNativeShare({ mobile: false })).toBe(false);
  });

  it("falls back to mobile UA sniffing", () => {
    expect(
      shouldUseRichNativeShare({
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      }),
    ).toBe(true);
    expect(
      shouldUseRichNativeShare({
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0",
      }),
    ).toBe(false);
  });
});

describe("bookLiveInstagramCaption", () => {
  it("uses owner voice by default", () => {
    const caption = bookLiveInstagramCaption({
      bookTitle: "Winter Light",
      artistName: "Jane Doe",
      bookUrl: "https://photobookers.com/books/winter-light",
    });
    expect(caption).toContain(
      'My book "Winter Light" by Jane Doe is live on @photobookers.',
    );
  });

  it("uses contributor voice when someone else submitted the book", () => {
    const caption = bookLiveInstagramCaption({
      bookTitle: "Winter Light",
      artistName: "Jane Doe",
      bookUrl: "https://photobookers.com/books/winter-light",
      addedBy: "contributor",
    });
    expect(caption).toContain(
      'I added book "Winter Light" by Jane Doe — live on @photobookers.',
    );
  });
});
