import { describe, expect, it } from "vitest";
import {
  baseShelfSlugFromUser,
  formatShelfOwnerName,
  isReservedShelfSlug,
  shelfSlugSchema,
  userCanHaveShelf,
  withShelfSlugSuffix,
} from "./utils";

describe("formatShelfOwnerName", () => {
  it("uses full name", () => {
    expect(
      formatShelfOwnerName({ firstName: "Jane", lastName: "Doe" }),
    ).toBe("Jane Doe");
  });

  it("never exposes email", () => {
    expect(
      formatShelfOwnerName({ email: "jane@example.com" }),
    ).toBe("A photobookers member");
  });
});

describe("userCanHaveShelf", () => {
  it("is true for any signed-in user", () => {
    expect(userCanHaveShelf({ id: "u1" })).toBe(true);
    expect(userCanHaveShelf({ id: "u2" })).toBe(true);
    expect(userCanHaveShelf({})).toBe(false);
    expect(userCanHaveShelf(null)).toBe(false);
  });
});

describe("shelfSlugSchema", () => {
  it("normalizes and validates slugs", () => {
    expect(shelfSlugSchema.parse("  Jane-Doe ")).toBe("jane-doe");
  });

  it("rejects invalid slugs", () => {
    expect(shelfSlugSchema.safeParse("").success).toBe(false);
    expect(shelfSlugSchema.safeParse("bad slug").success).toBe(false);
  });
});

describe("baseShelfSlugFromUser", () => {
  it("builds a slug from the user name", () => {
    expect(
      baseShelfSlugFromUser({ firstName: "Jane", lastName: "Doe" }),
    ).toBe("jane-doe");
  });
});

describe("withShelfSlugSuffix", () => {
  it("appends numeric suffix after the first collision", () => {
    expect(withShelfSlugSuffix("jane-doe", 1)).toBe("jane-doe");
    expect(withShelfSlugSuffix("jane-doe", 2)).toBe("jane-doe-2");
  });
});

describe("isReservedShelfSlug", () => {
  it("blocks reserved segments", () => {
    expect(isReservedShelfSlug("settings")).toBe(true);
    expect(isReservedShelfSlug("jane-doe")).toBe(false);
  });
});
