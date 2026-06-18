import { describe, expect, it } from "vitest";
import {
  appendPurchaseUtmParams,
  isHttpPurchaseUrl,
  outboundPurchasePath,
  parsePurchaseClickSource,
} from "./urls";

describe("outboundPurchasePath", () => {
  it("builds default web path without query string", () => {
    expect(outboundPurchasePath("winter-light")).toBe("/out/winter-light");
  });

  it("adds source query for hyperview", () => {
    expect(outboundPurchasePath("winter-light", "hyperview")).toBe(
      "/out/winter-light?source=hyperview",
    );
  });
});

describe("appendPurchaseUtmParams", () => {
  it("appends UTM params to a valid URL", () => {
    const result = appendPurchaseUtmParams(
      "https://shop.example.com/book",
      "winter-light",
    );
    const url = new URL(result);
    expect(url.searchParams.get("utm_source")).toBe("photobookers");
    expect(url.searchParams.get("utm_medium")).toBe("referral");
    expect(url.searchParams.get("utm_campaign")).toBe("book-winter-light");
  });

  it("returns original value when URL is invalid", () => {
    expect(appendPurchaseUtmParams("not-a-url", "winter-light")).toBe(
      "not-a-url",
    );
  });
});

describe("isHttpPurchaseUrl", () => {
  it("accepts http and https URLs", () => {
    expect(isHttpPurchaseUrl("https://shop.example.com")).toBe(true);
    expect(isHttpPurchaseUrl("http://shop.example.com")).toBe(true);
  });

  it("rejects non-http URLs", () => {
    expect(isHttpPurchaseUrl("ftp://shop.example.com")).toBe(false);
    expect(isHttpPurchaseUrl("")).toBe(false);
  });
});

describe("parsePurchaseClickSource", () => {
  it("defaults to web", () => {
    expect(parsePurchaseClickSource(undefined)).toBe("web");
    expect(parsePurchaseClickSource("newsletter")).toBe("web");
  });

  it("accepts hyperview", () => {
    expect(parsePurchaseClickSource("hyperview")).toBe("hyperview");
  });
});
