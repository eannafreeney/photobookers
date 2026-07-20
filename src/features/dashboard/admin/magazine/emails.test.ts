import { describe, it, expect } from "vitest";
import {
  buildMagazineArtistShareCaption,
  formatRevealDate,
  generateMagazineArtistPromptEmail,
} from "./emails";

describe("formatRevealDate", () => {
  it("formats an ISO date into a friendly weekday line", () => {
    const formatted = formatRevealDate("2026-08-06");
    expect(formatted).toContain("Thursday");
    expect(formatted).toContain("6 August 2026");
  });

  it("returns null for blank or missing input", () => {
    expect(formatRevealDate("")).toBeNull();
    expect(formatRevealDate("   ")).toBeNull();
    expect(formatRevealDate(null)).toBeNull();
    expect(formatRevealDate(undefined)).toBeNull();
  });

  it("returns null for an unparseable value", () => {
    expect(formatRevealDate("not-a-date")).toBeNull();
  });
});

describe("buildMagazineArtistShareCaption", () => {
  it("uses the issue number when the issue is numbered", () => {
    const caption = buildMagazineArtistShareCaption({
      bookTitle: "Concrete Hours",
      issueNumber: 1,
      issueTitle: "On the Sidewalk",
      issueUrl: "https://photobookers.com/magazine/on-the-sidewalk",
    });
    expect(caption).toContain('"Concrete Hours"');
    expect(caption).toContain("Issue 1 of @photobookers");
    expect(caption).toContain(
      "https://photobookers.com/magazine/on-the-sidewalk",
    );
    expect(caption).toContain("#photobook");
  });

  it("falls back to the title when there is no number yet", () => {
    const caption = buildMagazineArtistShareCaption({
      bookTitle: "Concrete Hours",
      issueNumber: null,
      issueTitle: "On the Sidewalk",
      issueUrl: "https://photobookers.com/magazine/on-the-sidewalk",
    });
    expect(caption).toContain('"On the Sidewalk" of @photobookers');
    expect(caption).not.toContain("Issue null");
  });
});

describe("generateMagazineArtistPromptEmail", () => {
  const base = {
    artistName: "Sam",
    bookTitle: "Concrete Hours",
    issueTitle: "On the Sidewalk",
    issueKicker: "Issue 1",
    issueNumber: 1 as number | null,
    artistPrompt: "What drew you to the street at dawn?",
    bookUrl: "https://photobookers.com/books/abc",
    issueUrl: "https://photobookers.com/magazine/on-the-sidewalk",
    coverUrl: "https://cdn.example.com/cover.jpg",
    revealDate: "Thursday, 6 August 2026",
  };

  it("includes the reveal-day line, cover image and share kit when provided", () => {
    const html = generateMagazineArtistPromptEmail(base);
    expect(html).toContain("Thursday, 6 August 2026");
    expect(html).toContain("Share kit");
    expect(html).toContain('src="https://cdn.example.com/cover.jpg"');
    expect(html).toContain("Ready-made caption");
    expect(html).toContain(
      "https://photobookers.com/magazine/on-the-sidewalk",
    );
  });

  it("omits the reveal-day line but keeps the share kit when no date is set", () => {
    const html = generateMagazineArtistPromptEmail({
      ...base,
      revealDate: null,
    });
    expect(html).not.toContain("goes live on our Instagram");
    expect(html).toContain("Share kit");
    expect(html).toContain("Ready-made caption");
  });

  it("omits the cover block when there is no cover", () => {
    const html = generateMagazineArtistPromptEmail({
      ...base,
      coverUrl: null,
    });
    expect(html).not.toContain("Here is your cover");
    expect(html).toContain("Share kit");
  });

  it("omits the question block when there is no question", () => {
    const html = generateMagazineArtistPromptEmail({
      ...base,
      artistPrompt: null,
    });
    expect(html).not.toContain("the question I have for you");
    expect(html).not.toContain("Just reply to this email");
    // Still a complete, sendable email with the feature line and share kit.
    expect(html).toContain("has been selected");
    expect(html).toContain("Share kit");
  });

  it("keeps the question block when a question is present", () => {
    const html = generateMagazineArtistPromptEmail(base);
    expect(html).toContain("the question I have for you");
    expect(html).toContain("What drew you to the street at dawn?");
  });
});
