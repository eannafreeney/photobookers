import { describe, expect, it } from "vitest";
import { isClientAbortError } from "./isClientAbortError";

describe("isClientAbortError", () => {
  it("matches Node body-parse abort (message: aborted)", () => {
    expect(isClientAbortError(new Error("aborted"))).toBe(true);
  });

  it("matches AbortError / ECONNRESET", () => {
    const abort = new Error("The operation was aborted");
    abort.name = "AbortError";
    expect(isClientAbortError(abort)).toBe(true);

    const reset = Object.assign(new Error("socket hang up"), {
      code: "ECONNRESET",
    });
    expect(isClientAbortError(reset)).toBe(true);
  });

  it("does not match real server failures", () => {
    expect(isClientAbortError(new Error("Upload failed: timeout"))).toBe(false);
    expect(isClientAbortError(new Error("db down"))).toBe(false);
  });
});
