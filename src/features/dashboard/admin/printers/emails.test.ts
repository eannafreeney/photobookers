import { describe, expect, it } from "vitest";
import { printerIntroEmailHtml, printerIntroEmailSubject } from "./emails";

const input = {
  name: "Studio & Co",
  profileUrl: "https://www.photobookers.com/printers/studio-co",
};

describe("printer intro email", () => {
  it("introduces the directory and asks for corrections, photos, and printed books", () => {
    const html = printerIntroEmailHtml({ ...input, profileIsPublic: true });

    expect(printerIntroEmailSubject()).toBe("Your printer page on Photobookers");
    expect(html).toContain("Hi Studio &amp; Co");
    expect(html).toContain("discovering photobooks");
    expect(html).toContain(
      "small directory of printers recommended directly by our community",
    );
    expect(html).toContain("submit quote requests through the site");
    expect(html).toContain(input.profileUrl);
    expect(html).toContain("email address or description");
    expect(html).toContain("photos that show off your photobook work");
    expect(html).toContain("link it on your page as social proof");
    expect(html).not.toContain("not public yet");
  });

  it("says the page is not public while the directory is off", () => {
    const html = printerIntroEmailHtml({ ...input, profileIsPublic: false });
    expect(html).toContain("not public yet");
  });
});
