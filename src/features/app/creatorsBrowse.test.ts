import { describe, expect, it } from "vitest";
import {
  creatorsBrowseUrl,
  parseCreatorBrowseFilter,
} from "./creatorsBrowse";

describe("parseCreatorBrowseFilter", () => {
  it("parses artist, publisher, and collector", () => {
    expect(parseCreatorBrowseFilter("artist", false)).toBe("artist");
    expect(parseCreatorBrowseFilter("publisher", true)).toBe("publisher");
    expect(parseCreatorBrowseFilter("collector", false)).toBe("collector");
  });

  it("parses following only when logged in", () => {
    expect(parseCreatorBrowseFilter("following", true)).toBe("following");
    expect(parseCreatorBrowseFilter("following", false)).toBe("all");
  });

  it("falls back to all for unknown values", () => {
    expect(parseCreatorBrowseFilter(undefined, true)).toBe("all");
    expect(parseCreatorBrowseFilter("nope", true)).toBe("all");
  });
});

describe("creatorsBrowseUrl", () => {
  it("builds the collector tab url", () => {
    expect(creatorsBrowseUrl("collector")).toBe("/creators?type=collector");
  });
});
