import { describe, expect, it, vi, beforeEach } from "vitest";

const {
  getCreatorByIdMock,
  createClaimWithStatusMock,
  assignUserAsCreatorOwnerAdminMock,
  sendCreatorVerifiedEmailMock,
} = vi.hoisted(() => ({
  getCreatorByIdMock: vi.fn(),
  createClaimWithStatusMock: vi.fn(),
  assignUserAsCreatorOwnerAdminMock: vi.fn(),
  sendCreatorVerifiedEmailMock: vi.fn(),
}));

vi.mock("../../lib/sendEmail", () => ({
  sendEmail: vi.fn(),
}));

vi.mock("../auth/services", () => ({
  verifyOtpForClaimSignup: vi.fn(),
}));

vi.mock("../dashboard/creators/services", () => ({
  getCreatorById: getCreatorByIdMock,
}));

vi.mock("../dashboard/admin/claims/services", () => ({
  assignUserAsCreatorOwnerAdmin: assignUserAsCreatorOwnerAdminMock,
}));

vi.mock("./services", () => ({
  createClaimWithStatus: createClaimWithStatusMock,
}));

vi.mock("./utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./utils")>();
  return {
    ...actual,
    sendCreatorVerifiedEmail: sendCreatorVerifiedEmailMock,
  };
});

import { registerAndClaimForCreator, submitClaimForUser } from "./actions";
import { verifyOtpForClaimSignup } from "../auth/services";

const user = {
  id: "user-1",
  email: "jane@example.com",
  firstName: "Jane",
  lastName: "Doe",
};

const creator = {
  id: "creator-1",
  displayName: "Jane Doe",
  website: "https://example.com",
};

describe("submitClaimForUser", () => {
  beforeEach(() => {
    getCreatorByIdMock.mockReset();
    createClaimWithStatusMock.mockReset();
    assignUserAsCreatorOwnerAdminMock.mockReset();
    sendCreatorVerifiedEmailMock.mockReset();

    createClaimWithStatusMock.mockResolvedValue([null, { id: "claim-1" }]);
    assignUserAsCreatorOwnerAdminMock.mockResolvedValue([null, {}]);
    sendCreatorVerifiedEmailMock.mockResolvedValue(undefined);
  });

  it("returns error when creator is missing", async () => {
    getCreatorByIdMock.mockResolvedValue([{ reason: "not found" }, null]);

    const result = await submitClaimForUser(user, "creator-1", {});

    expect(result).toEqual({ type: "error", message: "Creator not found" });
  });

  it("auto-approves when email domain matches listed website", async () => {
    getCreatorByIdMock.mockResolvedValue([null, creator]);

    const result = await submitClaimForUser(user, creator.id, {});

    expect(result).toEqual({ type: "approved" });
    expect(createClaimWithStatusMock).toHaveBeenCalledWith(
      user.id,
      creator.id,
      "https://example.com",
      "approved",
    );
    expect(assignUserAsCreatorOwnerAdminMock).toHaveBeenCalledWith(
      user.id,
      creator.id,
      true,
    );
    expect(sendCreatorVerifiedEmailMock).toHaveBeenCalledWith(user, creator);
  });

  it("goes to pending review when email domain does not match", async () => {
    getCreatorByIdMock.mockResolvedValue([null, creator]);

    const result = await submitClaimForUser(
      { ...user, email: "jane@gmail.com" },
      creator.id,
      {},
    );

    expect(result).toEqual({ type: "pending" });
    expect(createClaimWithStatusMock).toHaveBeenCalledWith(
      user.id,
      creator.id,
      "https://example.com",
      "pending_admin_review",
    );
    expect(assignUserAsCreatorOwnerAdminMock).not.toHaveBeenCalled();
  });

  it("goes pending when creator has no listed website even if email matches", async () => {
    getCreatorByIdMock.mockResolvedValue([
      null,
      { ...creator, website: null },
    ]);

    const result = await submitClaimForUser(user, creator.id, {
      verificationUrl: "https://example.com",
    });

    expect(result).toEqual({ type: "pending" });
    expect(createClaimWithStatusMock).toHaveBeenCalledWith(
      user.id,
      creator.id,
      "https://example.com",
      "pending_admin_review",
    );
  });

  it("rejects verification URL on a different domain", async () => {
    getCreatorByIdMock.mockResolvedValue([null, creator]);

    const result = await submitClaimForUser(user, creator.id, {
      form: { verificationUrl: "https://other.com" },
    });

    expect(result).toEqual({
      type: "error",
      message: `The URL must match the creator's listed website (${creator.website}).`,
    });
    expect(createClaimWithStatusMock).not.toHaveBeenCalled();
  });

  it("returns error when claim creation fails", async () => {
    getCreatorByIdMock.mockResolvedValue([null, creator]);
    createClaimWithStatusMock.mockResolvedValue([
      { reason: "duplicate claim" },
      null,
    ]);

    const result = await submitClaimForUser(user, creator.id, {});

    expect(result).toEqual({ type: "error", message: "duplicate claim" });
  });
});

describe("registerAndClaimForCreator", () => {
  const signupForm = {
    firstName: "Jane",
    lastName: "Claimant",
    type: "fan" as const,
    email: "jane@example.com",
    agreeToTerms: true,
    verificationUrl: "https://other.com",
    captchaToken: "token",
  };

  beforeEach(() => {
    getCreatorByIdMock.mockReset();
    vi.mocked(verifyOtpForClaimSignup).mockReset();
    getCreatorByIdMock.mockResolvedValue([
      null,
      { ...creator, status: "stub" },
    ]);
  });

  it("rejects verification URL on a different domain before signup", async () => {
    const result = await registerAndClaimForCreator(
      {} as never,
      creator.id,
      signupForm,
    );

    expect(result).toEqual({
      type: "error",
      message: `The URL must match the creator's listed website (${creator.website}).`,
    });
    expect(verifyOtpForClaimSignup).not.toHaveBeenCalled();
  });
});
