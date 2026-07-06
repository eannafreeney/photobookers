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
  type: "book_wishlisted",
  title: "Book wishlisted",
  body: `${formatNotificationActorName(user)} wishlisted the book: "${book.title}"`,
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
const createBookLikedNotification = async (user, book) => await createAdminNotification({
  type: "book_liked",
  title: "Book liked",
  body: `${formatNotificationActorName(user)} liked the book: "${book.title}"`,
  targetUrl: `/books/${book.slug}`,
  actorUserId: user.id
});
const createCreatorFollowedNotification = async (user, creator) => await createAdminNotification({
  type: "creator_followed",
  title: "Creator followed",
  body: `${formatNotificationActorName(user)} followed the creator: "${creator.displayName}"`,
  targetUrl: `/creators/${creator.slug}`,
  actorUserId: user.id
});
const createUserVerifiedNotification = async (welcomeName, user) => await createAdminNotification({
  type: "user_verified",
  title: "User verified",
  body: `${welcomeName} verified their account`,
  targetUrl: `/dashboard/admin/users/${user.id}`,
  actorUserId: user.id
});
const createInterviewSubmittedNotification = async (creator) => await createAdminNotification({
  type: "interview_submitted",
  title: "Interview submitted",
  body: `${creator.displayName} submitted their interview`,
  targetUrl: `/dashboard/admin/interviews`
});
export {
  createBookCollectedNotification,
  createBookLikedNotification,
  createBookPublishedNotification,
  createBookWishlistedNotification,
  createCommentCreatedNotification,
  createCommentUpdatedNotification,
  createCreatorClaimedNotification,
  createCreatorFollowedNotification,
  createInterviewSubmittedNotification,
  createMessageCreatedNotification,
  createNewPublisherNotification,
  createUserVerifiedNotification
};
