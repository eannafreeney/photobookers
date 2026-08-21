import { publishActivityEvent } from "../../lib/activityEvents.js";
import { formatActivityActorName } from "../app/homepageRecentActivityUtils.js";
const actorImageFor = (user) => user.creator?.coverUrl ?? user.profileImageUrl ?? null;
const actorNameFor = (user) => formatActivityActorName({
  firstName: user.firstName,
  lastName: user.lastName,
  creatorDisplayName: user.creator?.displayName
});
const publishFavouritedActivity = (user, book) => publishActivityEvent({
  type: "book_favourited",
  actorId: user.id,
  actorName: actorNameFor(user),
  actorImageUrl: actorImageFor(user),
  targetName: book.title,
  targetImageUrl: book.coverUrl,
  targetCreatorName: book.artist?.displayName ?? "",
  targetUrl: `/books/${book.slug}`
});
const publishCollectActivity = (user, book) => publishActivityEvent({
  type: "book_collected",
  actorId: user.id,
  actorName: actorNameFor(user),
  actorImageUrl: actorImageFor(user),
  targetName: book.title,
  targetImageUrl: book.coverUrl,
  targetCreatorName: book.artist?.displayName ?? "",
  targetUrl: `/books/${book.slug}`
});
const publishFollowActivity = (user, creator) => publishActivityEvent({
  type: "creator_followed",
  actorId: user.id,
  actorName: actorNameFor(user),
  actorImageUrl: actorImageFor(user),
  targetName: creator.displayName,
  targetImageUrl: creator.coverUrl,
  targetUrl: `/creators/${creator.slug}`
});
const publishCommentActivity = (user, book) => publishActivityEvent({
  type: "book_commented",
  actorId: user.id,
  actorName: actorNameFor(user),
  actorImageUrl: actorImageFor(user),
  targetName: book.title,
  targetImageUrl: book.coverUrl,
  targetCreatorName: book.artist?.displayName ?? "",
  targetUrl: `/books/${book.slug}`
});
export {
  publishCollectActivity,
  publishCommentActivity,
  publishFavouritedActivity,
  publishFollowActivity
};
