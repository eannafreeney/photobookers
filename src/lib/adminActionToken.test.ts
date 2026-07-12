import { describe, expect, it } from "vitest";
import {
  signInstagramCancelToken,
  verifyInstagramCancelToken,
} from "./adminActionToken";

describe("adminActionToken", () => {
  it("round-trips trending cancel actions", () => {
    process.env.AUTH_SECRET = "test-secret";
    const token = signInstagramCancelToken({
      type: "trending",
      campaignId: "campaign-1",
      kind: "books",
    });
    expect(verifyInstagramCancelToken(token)).toEqual({
      type: "trending",
      campaignId: "campaign-1",
      kind: "books",
    });
  });

  it("rejects tampered tokens", () => {
    process.env.AUTH_SECRET = "test-secret";
    const token = signInstagramCancelToken({
      type: "verified-creator",
      creatorId: "creator-1",
    });
    expect(verifyInstagramCancelToken(`${token}x`)).toBeNull();
  });
});
