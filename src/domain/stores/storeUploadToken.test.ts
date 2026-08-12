import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createStoreUploadToken, verifyStoreUploadToken } from "./storeUploadToken";

describe("storeUploadToken", () => {
  const prev = process.env.STORE_UPLOAD_SECRET;

  beforeEach(() => {
    process.env.STORE_UPLOAD_SECRET = "test-store-upload-secret";
  });

  afterEach(() => {
    if (prev === undefined) delete process.env.STORE_UPLOAD_SECRET;
    else process.env.STORE_UPLOAD_SECRET = prev;
  });

  it("round-trips a store id", () => {
    const token = createStoreUploadToken("store-123", 60_000);
    const [error, payload] = verifyStoreUploadToken(token);
    expect(error).toBeNull();
    expect(payload?.storeId).toBe("store-123");
  });

  it("rejects tampered tokens", () => {
    const token = createStoreUploadToken("store-123", 60_000);
    const [body] = token.split(".");
    const [error] = verifyStoreUploadToken(`${body}.not-a-real-signature`);
    expect(error?.reason).toBe("Invalid token");
  });

  it("rejects expired tokens", () => {
    const token = createStoreUploadToken("store-123", -1);
    const [error] = verifyStoreUploadToken(token);
    expect(error?.reason).toBe("Token expired");
  });
});
