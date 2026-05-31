import { describe, expect, it } from "vitest";
import {
  normalizeEmailInlineStyles,
  prepareNewsletterHtmlForEsp,
} from "./newsletterEspHtml";
import { renderWeeklyBOTDNewsletterHtmlMjml } from "./newsletterTemplateMjml";

describe("normalizeEmailInlineStyles", () => {
  it("strips quoted font-family values that break HTML style attributes", () => {
    expect(
      normalizeEmailInlineStyles(
        '<div style="font-family:&quot;Caveat&quot;, sans-serif">x</div>',
      ),
    ).toBe('<div style="font-family:Caveat, sans-serif">x</div>');
    expect(
      normalizeEmailInlineStyles(
        '<div style="font-family:\'Caveat\'">x</div>',
      ),
    ).toBe('<div style="font-family:Caveat">x</div>');
    expect(
      normalizeEmailInlineStyles('<div style="font-family:">x</div>'),
    ).toBe("<div style=\"\">x</div>");
  });
});

describe("prepareNewsletterHtmlForEsp", () => {
  it("inlines CSS and produces MailerLite-safe font-family values", () => {
    const html = renderWeeklyBOTDNewsletterHtmlMjml({
      weekStart: new Date(Date.UTC(2026, 4, 18)),
      weekEnd: new Date(Date.UTC(2026, 4, 24)),
      subject: "Weekly roundup",
      introText: "Intro",
      outroText: "Outro",
      ctaText: "Explore",
      items: [
        {
          date: "2026-05-31",
          bookId: "id",
          bookSlug: "some-book",
          title: "Some Book",
          coverUrl: "https://example.com/cover.jpg",
          artistName: null,
          artistSlug: null,
          publisherName: null,
          publisherSlug: null,
        },
      ],
      artistOfTheWeek: null,
      publisherOfTheWeek: null,
    });

    expect(html).toContain('class="esp-inline-styles"');
    expect(html).toContain("{$unsubscribe}");
    expect(html).not.toMatch(/font-family:"/);
    expect(html).not.toMatch(/font-family:'/);
    expect(html).not.toMatch(/font-family:&quot;/);
    expect(html).toContain("Some Book");
    expect(html).toContain("Caveat, cursive");
    expect(html).toContain("font-family:Instrument Sans");
  });
});
