import { publishActivityEvent } from "../../lib/activityEvents";
import { AuthUser } from "../../../types";

type ActivityBookTarget = {
  title: string;
  slug: string;
  artist?: { displayName: string } | null;
  coverUrl?: string | null;
};

type ActivityCreatorTarget = {
  displayName: string;
  slug: string;
  coverUrl?: string | null;
};

export const publishLikeActivity = (user: AuthUser, book: ActivityBookTarget) =>
  publishActivityEvent({
    type: "book_liked",
    actorId: user.id,
    targetName: book.title,
    targetImageUrl: book.coverUrl,
    targetCreatorName: book.artist?.displayName ?? "",
    targetUrl: `/books/${book.slug}`,
  });

export const publishFavouritedActivity = (
  user: AuthUser,
  book: ActivityBookTarget,
) =>
  publishActivityEvent({
    type: "book_favourited",
    actorId: user.id,
    targetName: book.title,
    targetImageUrl: book.coverUrl,
    targetCreatorName: book.artist?.displayName ?? "",
    targetUrl: `/books/${book.slug}`,
  });

export const publishCollectActivity = (
  user: AuthUser,
  book: ActivityBookTarget,
) =>
  publishActivityEvent({
    type: "book_collected",
    actorId: user.id,
    targetName: book.title,
    targetImageUrl: book.coverUrl,
    targetCreatorName: book.artist?.displayName ?? "",
    targetUrl: `/books/${book.slug}`,
  });

export const publishFollowActivity = (
  user: AuthUser,
  creator: ActivityCreatorTarget,
) =>
  publishActivityEvent({
    type: "creator_followed",
    actorId: user.id,
    targetName: creator.displayName,
    targetImageUrl: creator.coverUrl,
    targetUrl: `/creators/${creator.slug}`,
  });

export const publishCommentActivity = (
  user: AuthUser,
  book: ActivityBookTarget,
) =>
  publishActivityEvent({
    type: "book_commented",
    actorId: user.id,
    targetName: book.title,
    targetImageUrl: book.coverUrl,
    targetCreatorName: book.artist?.displayName ?? "",
    targetUrl: `/books/${book.slug}`,
  });
