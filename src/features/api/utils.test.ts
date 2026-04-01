import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUser } from "../../../types";
import {
  publishCollectActivity,
  publishCommentActivity,
  publishFollowActivity,
  publishLikeActivity,
  publishWishlistActivity,
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

  it("publishLikeActivity sends book_liked with book URLs and names", () => {
    publishLikeActivity(user, book);
    expect(publishActivityEvent).toHaveBeenCalledTimes(1);
    expect(publishActivityEvent).toHaveBeenCalledWith({
      type: "book_liked",
      actorId: user.id,
      actorName: "Pat",
      targetName: book.title,
      targetImageUrl: book.coverUrl,
      targetCreatorName: "Artist Name",
      targetUrl: "/books/my-book",
    });
  });

  it("uses creator displayName as actorName when present", () => {
    const creatorUser: AuthUser = {
      ...user,
      firstName: "Ignored",
      creator: { id: "c1", displayName: "Creator Display" } as AuthUser["creator"],
    };
    publishLikeActivity(creatorUser, book);
    expect(publishActivityEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        actorName: "Creator Display",
      }),
    );
  });

  it("uses Someone when no firstName or creator display name", () => {
    const minimal = { ...user, firstName: null };
    publishLikeActivity(minimal, book);
    expect(publishActivityEvent).toHaveBeenCalledWith(
      expect.objectContaining({ actorName: "Someone" }),
    );
  });

  it("publishWishlistActivity sends book_wishlisted", () => {
    publishWishlistActivity(user, book);
    expect(publishActivityEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "book_wishlisted" }),
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
      targetName: creator.displayName,
      targetImageUrl: creator.coverUrl,
      targetUrl: "/creators/creator-slug",
    });
  });

  it("publishCommentActivity sends book_commented", () => {
    publishCommentActivity(user, book);
    expect(publishActivityEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "book_commented" }),
    );
  });
});
