import { describe, expect, it } from "vitest";
import {
  normalizeTagForMatch,
  normalizeTagSlug,
  slugToTag,
  tagToSlug,
} from "./tags";

describe("tag slug helpers", () => {
  it("strips accents when building tag slugs", () => {
    expect(tagToSlug("São Paulo")).toBe("sao-paulo");
    expect(tagToSlug("são paulo")).toBe("sao-paulo");
  });

  it("normalizes accented tag params to ascii slugs", () => {
    expect(normalizeTagSlug("são-paulo")).toBe("sao-paulo");
    expect(normalizeTagSlug("SÃO--PAULO")).toBe("sao-paulo");
  });

  it("round-trips ascii slugs to searchable tag text", () => {
    expect(slugToTag("sao-paulo")).toBe("sao paulo");
    expect(normalizeTagForMatch(slugToTag("sao-paulo"))).toBe("sao paulo");
    expect(normalizeTagForMatch("São Paulo")).toBe("sao paulo");
  });
});
