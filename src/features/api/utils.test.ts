import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUser } from "../../../types";
import {
  publishCollectActivity,
  publishCommentActivity,
  publishFollowActivity,
  publishFavouritedActivity,
} from "./utils";

const publishActivityEvent = vi.hoisted(() => vi.fn());

vi.mock("../../lib/activityEvents", () => ({
  publishActivityEvent,
}));

describe("publish* activity helpers", () => {
  beforeEach(() => {
    publishActivityEvent.mockClear();
  });

  const user: AuthUser = {
    id: "user-1",
    email: "u@example.com",
    firstName: "Pat",
    lastName: null,
    profileImageUrl: null,
    shelfSlug: null,
    shelfPublic: false,
    creator: null,
    isAdmin: false,
    mustResetPassword: false,
  };

  const book = {
    title: "My Book",
    slug: "my-book",
    artist: { displayName: "Artist Name" },
    coverUrl: "https://example.com/cover.jpg",
  };

  it("publishWishlistActivity sends book_favourited", () => {
    publishFavouritedActivity(user, book);
    expect(publishActivityEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "book_favourited" }),
    );
  });

  it("publishCollectActivity sends book_collected", () => {
    publishCollectActivity(user, book);
    expect(publishActivityEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "book_collected" }),
    );
  });

  it("publishFollowActivity sends creator_followed with creator slug URL", () => {
    const creator = {
      displayName: "Creator",
      slug: "creator-slug",
      coverUrl: null,
    };
    publishFollowActivity(user, creator);
    expect(publishActivityEvent).toHaveBeenCalledWith({
      type: "creator_followed",
      actorId: user.id,
      actorName: "Pat",
      actorImageUrl: null,
      targetName: creator.displayName,
      targetImageUrl: creator.coverUrl,
      targetUrl: "/creators/creator-slug",
    });
  });

  it("sends the actor avatar so the live strip can show a face", () => {
    publishFavouritedActivity(
      { ...user, profileImageUrl: "https://example.com/pat.jpg" },
      book,
    );
    expect(publishActivityEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        actorImageUrl: "https://example.com/pat.jpg",
      }),
    );
  });

  it("prefers the actor's creator cover when they have a creator profile", () => {
    publishFavouritedActivity(
      {
        ...user,
        profileImageUrl: "https://example.com/pat.jpg",
        creator: {
          displayName: "Pat Press",
          coverUrl: "https://example.com/press.jpg",
        } as AuthUser["creator"],
      },
      book,
    );
    expect(publishActivityEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        actorName: "Pat Press",
        actorImageUrl: "https://example.com/press.jpg",
      }),
    );
  });

  it("publishCommentActivity sends book_commented", () => {
    publishCommentActivity(user, book);
    expect(publishActivityEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "book_commented" }),
    );
  });
});
