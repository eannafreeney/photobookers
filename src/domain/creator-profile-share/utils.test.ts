import { describe, expect, it } from "vitest";
import {
  CREATOR_PROFILE_SHARE_DAILY_LIMIT,
  resolveCreatorProfileShareDailyLimit,
} from "./utils";

describe("resolveCreatorProfileShareDailyLimit", () => {
  it("defaults to 10", () => {
    expect(CREATOR_PROFILE_SHARE_DAILY_LIMIT).toBe(10);
    expect(resolveCreatorProfileShareDailyLimit()).toBe(10);
  });

  it("honors a positive override", () => {
    expect(resolveCreatorProfileShareDailyLimit(3)).toBe(3);
  });
});
