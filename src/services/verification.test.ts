import { describe, expect, it } from "vitest";
import { getHostname, isSameDomain, normalizeUrl } from "./verification";

describe("normalizeUrl", () => {
  it("adds https when protocol is missing", () => {
    expect(normalizeUrl("example.com")).toBe("https://example.com");
  });

  it("preserves http protocol", () => {
    expect(normalizeUrl("http://example.com")).toBe("http://example.com");
  });

  it("strips trailing slash", () => {
    expect(normalizeUrl("https://example.com/")).toBe("https://example.com");
  });

  it("trims whitespace", () => {
    expect(normalizeUrl("  example.com  ")).toBe("https://example.com");
  });
});

describe("getHostname", () => {
  it("returns lowercase host without www", () => {
    expect(getHostname("https://WWW.Example.COM/page")).toBe("example.com");
  });

  it("returns empty string for invalid URLs", () => {
    expect(getHostname("not a url")).toBe("");
  });
});

describe("isSameDomain", () => {
  it("treats www and bare host as same domain", () => {
    expect(isSameDomain("https://www.example.com", "example.com")).toBe(true);
  });

  it("returns false for different domains", () => {
    expect(isSameDomain("https://example.com", "https://other.com")).toBe(
      false,
    );
  });
});
