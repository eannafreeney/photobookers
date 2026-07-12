import { describe, expect, it } from "vitest";
import type { AuthUser } from "../../types";
import type { Book, BookFair, Creator } from "../db/schema";
import {
  canClaimCreator,
  canClaimFairAttendance,
  canCollectBook,
  canDeleteBook,
  canEditBook,
  canEditCreator,
  canFollowCreator,
  canLikeBook,
  canPreviewBook,
  canPublishBook,
  canUnpublishBook,
  canWishlistBook,
  canWithdrawFairAttendance,
} from "./permissions";

const userId = "user-1";
const creatorId = "creator-1";
const otherCreatorId = "creator-2";

const baseCreator = {
  id: creatorId,
  createdByUserId: userId,
  status: "verified",
  ownerUserId: userId,
} as Creator;

const claimedCreator = {
  id: creatorId,
  createdByUserId: "admin-1",
  status: "verified",
  ownerUserId: userId,
} as Creator;

const unverifiedClaimedCreator = {
  ...claimedCreator,
  status: "stub",
} as Creator;

const fanUser: AuthUser = {
  id: "fan-1",
  email: "fan@example.com",
  firstName: "Fan",
  lastName: "User",
  profileImageUrl: null,
  creator: null,
  isAdmin: false,
  mustResetPassword: false,
};

const adminUser: AuthUser = {
  ...fanUser,
  id: "admin-1",
  isAdmin: true,
};

const creatorUser = (creator: Creator): AuthUser => ({
  id: userId,
  email: "creator@example.com",
  firstName: "Creator",
  lastName: "User",
  profileImageUrl: null,
  creator,
  isAdmin: false,
  mustResetPassword: false,
});

const baseBook = {
  artistId: creatorId,
  publisherId: otherCreatorId,
  createdByUserId: userId,
  approvalStatus: "approved",
  publicationStatus: "draft",
  coverUrl: "https://example.com/cover.jpg",
} as Book;

describe("canLikeBook / canWishlistBook / canCollectBook", () => {
  it("allows fans to interact with books", () => {
    expect(canLikeBook(fanUser, baseBook)).toBe(true);
    expect(canWishlistBook(fanUser, baseBook)).toBe(true);
    expect(canCollectBook(fanUser, baseBook)).toBe(true);
  });

  it("blocks creators from interacting with their own books", () => {
    const user = creatorUser(baseCreator);
    expect(canLikeBook(user, baseBook)).toBe(false);
    expect(canWishlistBook(user, { artistId: creatorId, publisherId: null })).toBe(
      false,
    );
    expect(canCollectBook(user, { artistId: null, publisherId: creatorId })).toBe(
      false,
    );
  });
});

describe("canEditBook", () => {
  it("denies unauthenticated users", () => {
    expect(canEditBook(null, baseBook)).toBe(false);
  });

  it("allows admins", () => {
    expect(canEditBook(adminUser, baseBook)).toBe(true);
  });

  it("allows verified owner to edit owned books", () => {
    expect(canEditBook(creatorUser(baseCreator), baseBook)).toBe(true);
  });

  it("allows unverified claimed creator to edit only books they created", () => {
    const user = creatorUser(unverifiedClaimedCreator);
    expect(canEditBook(user, { ...baseBook, createdByUserId: userId })).toBe(
      true,
    );
    expect(canEditBook(user, { ...baseBook, createdByUserId: "other-user" })).toBe(
      false,
    );
  });

  it("allows editing pending books created by the user", () => {
    const user = creatorUser({ ...baseCreator, status: "stub" } as Creator);
    expect(
      canEditBook(user, {
        ...baseBook,
        approvalStatus: "pending",
        artistId: "other-artist",
      }),
    ).toBe(true);
  });
});

describe("canDeleteBook", () => {
  it("denies unverified claimed creators entirely", () => {
    expect(canDeleteBook(creatorUser(unverifiedClaimedCreator), baseBook)).toBe(
      false,
    );
  });

  it("allows verified owner to delete owned books", () => {
    expect(canDeleteBook(creatorUser(baseCreator), baseBook)).toBe(true);
  });
});

describe("canPreviewBook", () => {
  it("allows admin regardless of draft state", () => {
    expect(
      canPreviewBook(adminUser, {
        ...baseBook,
        publicationStatus: "draft",
        coverUrl: null,
      }),
    ).toBe(true);
  });

  it("requires cover and draft ownership for creators", () => {
    const user = creatorUser(baseCreator);
    expect(
      canPreviewBook(user, {
        ...baseBook,
        publicationStatus: "draft",
        coverUrl: "https://example.com/cover.jpg",
      }),
    ).toBe(true);
    expect(
      canPreviewBook(user, {
        ...baseBook,
        publicationStatus: "published",
        coverUrl: "https://example.com/cover.jpg",
      }),
    ).toBe(false);
  });
});

describe("canEditCreator", () => {
  const creator = {
    id: creatorId,
    ownerUserId: userId,
    status: "verified",
  } as Creator;

  it("allows verified owner", () => {
    expect(canEditCreator(creatorUser(baseCreator), creator)).toBe(true);
  });

  it("denies non-owner and unverified creators", () => {
    expect(canEditCreator(fanUser, creator)).toBe(false);
    expect(
      canEditCreator(
        creatorUser({ ...baseCreator, status: "stub" } as Creator),
        creator,
      ),
    ).toBe(false);
  });
});

describe("canClaimCreator", () => {
  it("allows fans who do not already own a profile", () => {
    expect(
      canClaimCreator(fanUser, { id: creatorId, ownerUserId: null } as Creator),
    ).toBe(true);
  });

  it("blocks users who already have a creator profile or own the profile", () => {
    expect(canClaimCreator(creatorUser(baseCreator), baseCreator)).toBe(false);
    expect(
      canClaimCreator(fanUser, { id: creatorId, ownerUserId: fanUser.id } as Creator),
    ).toBe(false);
  });
});

describe("canPublishBook / canUnpublishBook", () => {
  const publishableBook = {
    ...baseBook,
    approvalStatus: "approved",
    coverUrl: "https://example.com/cover.jpg",
    publicationStatus: "draft",
  } as Book;

  it("requires verified creator with approved book and cover", () => {
    expect(canPublishBook(creatorUser(baseCreator), publishableBook)).toBe(true);
    expect(
      canPublishBook(
        creatorUser({ ...baseCreator, status: "stub" } as Creator),
        publishableBook,
      ),
    ).toBe(false);
    expect(
      canPublishBook(creatorUser(baseCreator), {
        ...publishableBook,
        coverUrl: null,
      }),
    ).toBe(false);
  });

  it("allows unpublish only for published books", () => {
    expect(
      canUnpublishBook(creatorUser(baseCreator), {
        ...publishableBook,
        publicationStatus: "published",
      }),
    ).toBe(true);
    expect(canUnpublishBook(creatorUser(baseCreator), publishableBook)).toBe(
      false,
    );
  });
});

describe("canFollowCreator", () => {
  it("allows fans and other creators to follow", () => {
    expect(canFollowCreator(fanUser, { id: creatorId, displayName: "Jane" })).toBe(
      true,
    );
    expect(
      canFollowCreator(creatorUser(baseCreator), {
        id: otherCreatorId,
        displayName: "Other",
      }),
    ).toBe(true);
  });

  it("blocks following yourself", () => {
    expect(
      canFollowCreator(creatorUser(baseCreator), {
        id: creatorId,
        displayName: "Jane",
      }),
    ).toBe(false);
  });
});

describe("fair attendance permissions", () => {
  const futureFair = {
    status: "published",
    approvalStatus: "approved",
    endDate: new Date(Date.now() + 86_400_000),
  } as BookFair;

  const pastFair = {
    ...futureFair,
    endDate: new Date(Date.now() - 86_400_000),
  } as BookFair;

  it("allows verified creators to claim attendance on open fairs", () => {
    expect(canClaimFairAttendance(creatorUser(baseCreator), futureFair)).toBe(
      true,
    );
    expect(canClaimFairAttendance(fanUser, futureFair)).toBe(false);
    expect(canClaimFairAttendance(creatorUser(baseCreator), pastFair)).toBe(
      false,
    );
  });

  it("allows verified owner to withdraw before fair ends", () => {
    expect(
      canWithdrawFairAttendance(creatorUser(baseCreator), futureFair, creatorId),
    ).toBe(true);
    expect(
      canWithdrawFairAttendance(creatorUser(baseCreator), pastFair, creatorId),
    ).toBe(false);
    expect(
      canWithdrawFairAttendance(creatorUser(baseCreator), futureFair, "other"),
    ).toBe(false);
  });
});
