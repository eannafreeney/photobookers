import { createAdminNotification } from "./services";

type NotificationBookTarget = {
  title: string;
  slug: string;
};

type NotificationCreatorTarget = {
  displayName: string;
  slug: string;
};

type NotificationUserTarget = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  creator?: {
    displayName: string;
  } | null;
};

function formatNotificationActorName(user: NotificationUserTarget): string {
  const creatorName = user.creator?.displayName?.trim();
  if (creatorName) return creatorName;

  const fullName = [user.firstName, user.lastName]
    .filter((part) => part?.trim())
    .join(" ")
    .trim();
  if (fullName) return fullName;

  const email = user.email?.trim();
  if (email) return email;

  return "A user";
}

type NotificationMessageTarget = {
  body: string;
};

export const createCommentCreatedNotification = async (
  user: NotificationUserTarget,
  book: NotificationBookTarget,
) =>
  await createAdminNotification({
    type: "book_commented",
    title: "New comment",
    body: `${formatNotificationActorName(user)} commented on "${book.title}"`,
    targetUrl: `/books/${book.slug}`,
    actorUserId: user.id,
  });

export const createCommentUpdatedNotification = async (
  user: NotificationUserTarget,
  book: NotificationBookTarget,
) =>
  await createAdminNotification({
    type: "book_comment_updated",
    title: "Updated comment",
    body: `${formatNotificationActorName(user)} updated a comment on "${book.title}"`,
    targetUrl: `/books/${book.slug}`,
    actorUserId: user.id,
  });

export const createBookPublishedNotification = async (
  user: NotificationUserTarget,
  book: NotificationBookTarget,
) =>
  await createAdminNotification({
    type: "book_published",
    title: "New book published",
    body: `${formatNotificationActorName(user)} published a new book: "${book.title}"`,
    targetUrl: `/books/${book.slug}`,
    actorUserId: user.id,
  });

export const createNewPublisherNotification = async (
  user: NotificationUserTarget,
  creator: NotificationCreatorTarget,
) =>
  await createAdminNotification({
    type: "new_publisher",
    title: "New publisher",
    body: `${formatNotificationActorName(user)} is a new publisher`,
    targetUrl: `/creators/${creator.slug}`,
    actorUserId: user.id,
  });

export const createCreatorClaimedNotification = async (
  user: NotificationUserTarget,
  creator: NotificationCreatorTarget,
) =>
  await createAdminNotification({
    type: "creator_claimed",
    title: "Creator claimed",
    body: `${formatNotificationActorName(user)} claimed the creator: "${creator.displayName}"`,
    targetUrl: `/creators/${creator.slug}`,
    actorUserId: user.id,
  });

export const createBookCollectedNotification = async (
  user: NotificationUserTarget,
  book: NotificationBookTarget,
) =>
  await createAdminNotification({
    type: "book_collected",
    title: "Book collected",
    body: `${formatNotificationActorName(user)} collected the book: "${book.title}"`,
    targetUrl: `/books/${book.slug}`,
    actorUserId: user.id,
  });

export const createBookWishlistedNotification = async (
  user: NotificationUserTarget,
  book: NotificationBookTarget,
) =>
  await createAdminNotification({
    type: "book_favourited",
    title: "Book favourited",
    body: `${formatNotificationActorName(user)} favourited the book: "${book.title}"`,
    targetUrl: `/books/${book.slug}`,
    actorUserId: user.id,
  });

export const createMessageCreatedNotification = async (
  user: NotificationUserTarget,
  creator: NotificationCreatorTarget,
  message: NotificationMessageTarget,
) =>
  await createAdminNotification({
    type: "message_created",
    title: "Message created",
    body: `${formatNotificationActorName(user)} created a message`,
    targetUrl: `/creators/${creator?.slug}`,
    actorUserId: user.id,
  });

export const createBookLikedNotification = async (
  user: NotificationUserTarget,
  book: NotificationBookTarget,
) =>
  await createAdminNotification({
    type: "book_liked",
    title: "Book liked",
    body: `${formatNotificationActorName(user)} liked the book: "${book.title}"`,
    targetUrl: `/books/${book.slug}`,
    actorUserId: user.id,
  });

export const createCreatorFollowedNotification = async (
  user: NotificationUserTarget,
  creator: NotificationCreatorTarget,
) =>
  await createAdminNotification({
    type: "creator_followed",
    title: "Creator followed",
    body: `${formatNotificationActorName(user)} followed the creator: "${creator.displayName}"`,
    targetUrl: `/creators/${creator.slug}`,
    actorUserId: user.id,
  });

export const createUserVerifiedNotification = async (
  welcomeName: string,
  user: NotificationUserTarget,
) =>
  await createAdminNotification({
    type: "user_verified",
    title: "User verified",
    body: `${welcomeName} verified their account`,
    targetUrl: `/dashboard/admin/users/${user.id}`,
    actorUserId: user.id,
  });

export const createInterviewSubmittedNotification = async (
  creator: NotificationCreatorTarget,
) =>
  await createAdminNotification({
    type: "interview_submitted",
    title: "Interview submitted",
    body: `${creator.displayName} submitted their interview`,
    targetUrl: `/dashboard/admin/interviews`,
  });
