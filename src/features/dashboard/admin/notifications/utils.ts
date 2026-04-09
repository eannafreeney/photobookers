import z from "zod";
import {
  registerCreatorFormSchema,
  registerFanFormSchema,
} from "../../../auth/schema";
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
  firstName?: string | null;
  lastName?: string | null;
};

export const createCommentCreatedNotification = async (
  user: NotificationUserTarget,
  book: NotificationBookTarget,
) =>
  await createAdminNotification({
    type: "book_commented",
    title: "New comment",
    body: `${user?.firstName ?? "A user"} commented on "${book.title}"`,
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
    body: `${user?.firstName ?? "A user"} updated a comment on "${book.title}"`,
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
    body: `${user?.firstName ?? "A user"} published a new book: "${book.title}"`,
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
    body: `${creator.displayName} is a new publisher`,
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
    body: `${user?.firstName ?? "A user"} claimed the creator: "${creator.displayName}"`,
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
    body: `${user?.firstName ?? "A user"} collected the book: "${book.title}"`,
    targetUrl: `/books/${book.slug}`,
    actorUserId: user.id,
  });

export const createBookWishlistedNotification = async (
  user: NotificationUserTarget,
  book: NotificationBookTarget,
) =>
  await createAdminNotification({
    type: "book_wishlisted",
    title: "Book wishlisted",
    body: `${user?.firstName ?? "A user"} wishlisted the book: "${book.title}"`,
    targetUrl: `/books/${book.slug}`,
    actorUserId: user.id,
  });

export const createBookLikedNotification = async (
  user: NotificationUserTarget,
  book: NotificationBookTarget,
) =>
  await createAdminNotification({
    type: "book_liked",
    title: "Book liked",
    body: `${user?.firstName ?? "A user"} liked the book: "${book.title}"`,
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
    body: `${user?.firstName ?? "A user"} followed the creator: "${creator.displayName}"`,
    targetUrl: `/creators/${creator.slug}`,
    actorUserId: user.id,
  });

export const createUserVerifiedNotification = async (
  user: NotificationUserTarget,
) =>
  await createAdminNotification({
    type: "user_verified",
    title: "User verified",
    body: `${user?.firstName ? `${user.firstName} ${user.lastName}` : "A user"} verified their account`,
    targetUrl: `/dashboard/admin/users/${user.id}`,
    actorUserId: user.id,
  });

export const createCreatorSignedUpNotification = async (
  formData: z.infer<typeof registerCreatorFormSchema>,
) =>
  await createAdminNotification({
    type: "creator_signed_up",
    title: "New creator signed up",
    body: `A user signed up as a creator: "${formData.displayName}"`,
    targetUrl: null,
    actorUserId: null,
  });

export const createFanSignedUpNotification = async (
  formData: z.infer<typeof registerFanFormSchema>,
) =>
  await createAdminNotification({
    type: "fan_signed_up",
    title: "New fan signed up",
    body: `A user signed up as a fan: "${formData.firstName} ${formData.lastName}"`,
    targetUrl: null,
    actorUserId: null,
  });
