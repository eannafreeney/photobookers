import { describe, expect, it } from "vitest";
import { parseDateString, toDateInputValue } from "./utils";

describe("toDateInputValue", () => {
  it("formats a valid date as YYYY-MM-DD", () => {
    expect(toDateInputValue(new Date("2013-06-17T00:00:00.000Z"))).toBe(
      "2013-06-17",
    );
  });

  it("returns empty for missing values", () => {
    expect(toDateInputValue(null)).toBe("");
    expect(toDateInputValue(undefined)).toBe("");
    expect(toDateInputValue("")).toBe("");
  });

  it("returns empty for Invalid Date (postgres year 0013 timestamps)", () => {
    expect(toDateInputValue(new Date("0013-06-17 00:00:00"))).toBe("");
    expect(toDateInputValue(new Date(NaN))).toBe("");
  });
});

describe("parseDateString", () => {
  it("rejects years that Date.UTC maps to 1900-1999", () => {
    expect(Number.isNaN(parseDateString("0013-06-17").getTime())).toBe(true);
  });
});
