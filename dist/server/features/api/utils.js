import { publishActivityEvent } from "../../lib/activityEvents.js";
const publishLikeActivity = (user, book) => publishActivityEvent({
  type: "book_liked",
  actorId: user.id,
  targetName: book.title,
  targetImageUrl: book.coverUrl,
  targetCreatorName: book.artist?.displayName ?? "",
  targetUrl: `/books/${book.slug}`
});
const publishFavouritedActivity = (user, book) => publishActivityEvent({
  type: "book_favourited",
  actorId: user.id,
  targetName: book.title,
  targetImageUrl: book.coverUrl,
  targetCreatorName: book.artist?.displayName ?? "",
  targetUrl: `/books/${book.slug}`
});
const publishCollectActivity = (user, book) => publishActivityEvent({
  type: "book_collected",
  actorId: user.id,
  targetName: book.title,
  targetImageUrl: book.coverUrl,
  targetCreatorName: book.artist?.displayName ?? "",
  targetUrl: `/books/${book.slug}`
});
const publishFollowActivity = (user, creator) => publishActivityEvent({
  type: "creator_followed",
  actorId: user.id,
  targetName: creator.displayName,
  targetImageUrl: creator.coverUrl,
  targetUrl: `/creators/${creator.slug}`
});
const publishCommentActivity = (user, book) => publishActivityEvent({
  type: "book_commented",
  actorId: user.id,
  targetName: book.title,
  targetImageUrl: book.coverUrl,
  targetCreatorName: book.artist?.displayName ?? "",
  targetUrl: `/books/${book.slug}`
});
export {
  publishCollectActivity,
  publishCommentActivity,
  publishFavouritedActivity,
  publishFollowActivity,
  publishLikeActivity
};
