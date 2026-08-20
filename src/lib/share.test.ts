import { describe, expect, it } from "vitest";
import { nativeSharePayload } from "./share";

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
