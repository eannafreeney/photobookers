import { createAdminNotification } from "./services.js";
function formatNotificationActorName(user) {
  const creatorName = user.creator?.displayName?.trim();
  if (creatorName) return creatorName;
  const fullName = [user.firstName, user.lastName].filter((part) => part?.trim()).join(" ").trim();
  if (fullName) return fullName;
  const email = user.email?.trim();
  if (email) return email;
  return "A user";
}
const createCommentCreatedNotification = async (user, book) => await createAdminNotification({
  type: "book_commented",
  title: "New comment",
  body: `${formatNotificationActorName(user)} commented on "${book.title}"`,
  targetUrl: `/books/${book.slug}`,
  actorUserId: user.id
});
const createCommentUpdatedNotification = async (user, book) => await createAdminNotification({
  type: "book_comment_updated",
  title: "Updated comment",
  body: `${formatNotificationActorName(user)} updated a comment on "${book.title}"`,
  targetUrl: `/books/${book.slug}`,
  actorUserId: user.id
});
const createBookPublishedNotification = async (user, book) => await createAdminNotification({
  type: "book_published",
  title: "New book published",
  body: `${formatNotificationActorName(user)} published a new book: "${book.title}"`,
  targetUrl: `/books/${book.slug}`,
  actorUserId: user.id
});
const createNewPublisherNotification = async (user, creator) => await createAdminNotification({
  type: "new_publisher",
  title: "New publisher",
  body: `${formatNotificationActorName(user)} is a new publisher`,
  targetUrl: `/creators/${creator.slug}`,
  actorUserId: user.id
});
const createCreatorClaimedNotification = async (user, creator) => await createAdminNotification({
  type: "creator_claimed",
  title: "Creator claimed",
  body: `${formatNotificationActorName(user)} claimed the creator: "${creator.displayName}"`,
  targetUrl: `/creators/${creator.slug}`,
  actorUserId: user.id
});
const createBookCollectedNotification = async (user, book) => await createAdminNotification({
  type: "book_collected",
  title: "Book collected",
  body: `${formatNotificationActorName(user)} collected the book: "${book.title}"`,
  targetUrl: `/books/${book.slug}`,
  actorUserId: user.id
});
const createBookWishlistedNotification = async (user, book) => await createAdminNotification({
  type: "book_favourited",
  title: "Book favourited",
  body: `${formatNotificationActorName(user)} favourited the book: "${book.title}"`,
  targetUrl: `/books/${book.slug}`,
  actorUserId: user.id
});
const createMessageCreatedNotification = async (user, creator, message) => await createAdminNotification({
  type: "message_created",
  title: "Message created",
  body: `${formatNotificationActorName(user)} created a message`,
  targetUrl: `/creators/${creator?.slug}`,
  actorUserId: user.id
});
const createCreatorFollowedNotification = async (user, creator) => await createAdminNotification({
  type: "creator_followed",
  title: "Creator followed",
  body: `${formatNotificationActorName(user)} followed the creator: "${creator.displayName}"`,
  targetUrl: `/creators/${creator.slug}`,
  actorUserId: user.id
});
const createCollectorFollowedNotification = async (actor, target) => await createAdminNotification({
  type: "collector_followed",
  title: "Collector followed",
  body: `${formatNotificationActorName(actor)} followed the collector: "${formatNotificationActorName(target)}"`,
  targetUrl: target.shelfSlug ? `/shelf/${target.shelfSlug}` : `/dashboard/admin/users/${target.id}`,
  actorUserId: actor.id
});
const createUserVerifiedNotification = async (welcomeName, user) => await createAdminNotification({
  type: "user_verified",
  title: "User verified",
  body: `${welcomeName} verified their account`,
  targetUrl: `/dashboard/admin/users/${user.id}`,
  actorUserId: user.id
});
export {
  createBookCollectedNotification,
  createBookPublishedNotification,
  createBookWishlistedNotification,
  createCollectorFollowedNotification,
  createCommentCreatedNotification,
  createCommentUpdatedNotification,
  createCreatorClaimedNotification,
  createCreatorFollowedNotification,
  createMessageCreatedNotification,
  createNewPublisherNotification,
  createUserVerifiedNotification
};
