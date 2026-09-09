import { describe, expect, it } from "vitest";
import { isMalformedBodyError } from "./isMalformedBodyError";

describe("isMalformedBodyError", () => {
  it("matches Node/undici formData() failures", () => {
    expect(
      isMalformedBodyError(
        new TypeError("Failed to parse body as FormData."),
      ),
    ).toBe(true);
  });

  it("does not match real server failures", () => {
    expect(isMalformedBodyError(new Error("db down"))).toBe(false);
    expect(isMalformedBodyError(new Error("Upload failed: timeout"))).toBe(
      false,
    );
  });
});
