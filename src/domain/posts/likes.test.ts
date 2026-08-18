import { describe, expect, it } from "vitest";
import { canLikePost } from "./likesPolicy";

describe("canLikePost", () => {
  it("denies logged-out users", () => {
    expect(
      canLikePost({
        userId: null,
        postAuthorUserId: "author-1",
        authorCreatorIds: [],
        followedCreatorIds: [],
      }),
    ).toBe(false);
  });

  it("allows liking your own post", () => {
    expect(
      canLikePost({
        userId: "author-1",
        postAuthorUserId: "author-1",
        authorCreatorIds: ["creator-1"],
        followedCreatorIds: [],
      }),
    ).toBe(true);
  });

  it("allows admins", () => {
    expect(
      canLikePost({
        userId: "admin-1",
        isAdmin: true,
        postAuthorUserId: "author-1",
        authorCreatorIds: ["creator-1"],
        followedCreatorIds: [],
      }),
    ).toBe(true);
  });

  it("allows liking a non-creator post without following", () => {
    expect(
      canLikePost({
        userId: "fan-1",
        postAuthorUserId: "author-1",
        authorCreatorIds: [],
        followedCreatorIds: [],
      }),
    ).toBe(true);
  });

  it("blocks liking a creator post unless you follow them", () => {
    expect(
      canLikePost({
        userId: "fan-1",
        postAuthorUserId: "author-1",
        authorCreatorIds: ["creator-1"],
        followedCreatorIds: [],
      }),
    ).toBe(false);
  });

  it("allows liking a creator post when you follow them", () => {
    expect(
      canLikePost({
        userId: "fan-1",
        postAuthorUserId: "author-1",
        authorCreatorIds: ["creator-1"],
        followedCreatorIds: ["creator-1"],
      }),
    ).toBe(true);
  });
});
