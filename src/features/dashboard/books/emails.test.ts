import { describe, expect, it } from "vitest";
import {
  bookLiveEmailSubject,
  buildBookLiveEmailHtml,
} from "./emails";

describe("buildBookLiveEmailHtml", () => {
  it("includes cover image, book link, and share kit", () => {
    const html = buildBookLiveEmailHtml({
      recipientName: "Jane Doe",
      bookTitle: "Winter Light",
      artistName: "Jane Doe",
      bookSlug: "winter-light-jane-doe",
      coverUrl: "https://cdn.example.com/cover.jpg",
      instagram: "@janedoe",
    });

    expect(html).toContain("is now live on Photobookers");
    expect(html).toContain("https://cdn.example.com/cover.jpg");
    expect(html).toContain("Share kit");
    expect(html).toContain("My book &quot;Winter Light&quot;");
    expect(html).toContain("@janedoe");
    expect(html).toContain("/books/winter-light-jane-doe");
  });

  it("uses contributor share copy when the submitter added someone else's book", () => {
    const html = buildBookLiveEmailHtml({
      recipientName: "Sam Contributor",
      bookTitle: "Winter Light",
      artistName: "Jane Doe",
      bookSlug: "winter-light-jane-doe",
      coverUrl: "https://cdn.example.com/cover.jpg",
      addedBy: "contributor",
    });

    expect(html).toContain(
      "I added book &quot;Winter Light&quot; by Jane Doe — live on @photobookers.",
    );
    expect(html).not.toContain("My book &quot;Winter Light&quot;");
  });
});

describe("bookLiveEmailSubject", () => {
  it("names the book in the subject", () => {
    expect(bookLiveEmailSubject("Winter Light")).toBe(
      "Your book is live: Winter Light",
    );
  });
});
