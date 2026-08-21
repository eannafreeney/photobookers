import { beforeEach, describe, expect, it } from "vitest";
import {
  BADGE_SPECS,
  badgeAssetUrl,
  badgeEmbedHtml,
  badgeProfileUrl,
  MAX_REFERRAL_LENGTH,
  parseCreatorReferral,
} from "./embedBadge";

describe("parseCreatorReferral", () => {
  it("accepts slug-shaped tags, lowercased", () => {
    expect(parseCreatorReferral("badge")).toBe("badge");
    expect(parseCreatorReferral("  Badge  ")).toBe("badge");
    expect(parseCreatorReferral("badge_wide-2")).toBe("badge_wide-2");
  });

  it("rejects empty and missing values", () => {
    expect(parseCreatorReferral(undefined)).toBeNull();
    expect(parseCreatorReferral(null)).toBeNull();
    expect(parseCreatorReferral("   ")).toBeNull();
  });

  it("rejects values that would pollute analytics or the column", () => {
    expect(parseCreatorReferral("a".repeat(MAX_REFERRAL_LENGTH + 1))).toBeNull();
    expect(parseCreatorReferral("-leading-dash")).toBeNull();
    expect(parseCreatorReferral("has space")).toBeNull();
    expect(parseCreatorReferral("<script>")).toBeNull();
    expect(parseCreatorReferral("drop;table")).toBeNull();
  });
});

describe("badge urls", () => {
  beforeEach(() => {
    process.env.PUBLIC_APP_URL = "https://www.photobookers.com";
  });

  it("tags the profile link so the visit is attributable", () => {
    expect(badgeProfileUrl("jane-doe")).toBe(
      "https://www.photobookers.com/creators/jane-doe?ref=badge",
    );
  });

  it("builds absolute asset urls for every variant", () => {
    for (const spec of BADGE_SPECS) {
      expect(badgeAssetUrl(spec.variant)).toBe(
        `https://www.photobookers.com/badge/${spec.file}`,
      );
    }
  });

  it("does not double up the slash when the base url has a trailing one", () => {
    process.env.PUBLIC_APP_URL = "https://www.photobookers.com/";
    expect(badgeAssetUrl("brand")).toBe(
      "https://www.photobookers.com/badge/icon.svg",
    );
  });
});

describe("badgeEmbedHtml", () => {
  beforeEach(() => {
    process.env.PUBLIC_APP_URL = "https://www.photobookers.com";
  });

  it("produces a plain anchor + img snippet with absolute urls", () => {
    const html = badgeEmbedHtml({
      slug: "jane-doe",
      displayName: "Jane Doe",
      variant: "brand",
    });

    expect(html).toContain(
      'href="https://www.photobookers.com/creators/jane-doe?ref=badge"',
    );
    expect(html).toContain(
      'src="https://www.photobookers.com/badge/icon.svg"',
    );
    expect(html).toContain('alt="Jane Doe on Photobookers"');
    expect(html).toContain('width="32" height="32"');
    expect(html).toContain('rel="noopener"');
  });

  it("carries the dimensions of the chosen variant", () => {
    const html = badgeEmbedHtml({
      slug: "jane-doe",
      displayName: "Jane Doe",
      variant: "wordmark",
    });
    expect(html).toContain('width="146" height="40"');
  });

  it("escapes display names so a quote cannot break out of the alt attribute", () => {
    const html = badgeEmbedHtml({
      slug: "jane-doe",
      displayName: 'Jane "JD" Doe & Co <b>',
      variant: "brand",
    });

    expect(html).toContain(
      'alt="Jane &quot;JD&quot; Doe &amp; Co &lt;b&gt; on Photobookers"',
    );
    expect(html).not.toContain("<b>");
  });
});
