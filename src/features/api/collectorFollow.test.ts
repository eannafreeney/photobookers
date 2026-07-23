import { describe, expect, it } from "vitest";
import { canFollowCollector } from "./collectorFollow";

describe("canFollowCollector", () => {
  it("rejects self-follow", () => {
    expect(canFollowCollector("user-1", "user-1")).toBe(false);
  });

  it("allows following another user when logged in", () => {
    expect(canFollowCollector("user-1", "user-2")).toBe(true);
  });

  it("rejects when logged out", () => {
    expect(canFollowCollector(null, "user-2")).toBe(false);
    expect(canFollowCollector(undefined, "user-2")).toBe(false);
  });
});
