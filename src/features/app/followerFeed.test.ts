import { describe, expect, it } from "vitest";
import { parseFeedTab } from "./followerFeed";

describe("parseFeedTab", () => {
  it("defaults to posts", () => {
    expect(parseFeedTab(undefined)).toBe("posts");
    expect(parseFeedTab("posts")).toBe("posts");
    expect(parseFeedTab("nope")).toBe("posts");
  });

  it("accepts books", () => {
    expect(parseFeedTab("books")).toBe("books");
  });
});
