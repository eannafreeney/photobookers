import { count, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  adminNotifications
} from "../../db/schema.js";
import { getPagination } from "../../lib/pagination.js";
import { err, ok } from "../../lib/result.js";
import { sendAdminEmail } from "../../lib/sendEmail.js";
import { generateBookPendingReviewEmail } from "./emails.js";
const createAdminNotification = async (input) => {
  try {
    const [row] = await db.insert(adminNotifications).values(input).returning();
    return ok(row);
  } catch (error) {
    console.error("Failed to create admin notification", error);
    return err({ reason: "Failed to create admin notification", cause: error });
  }
};
const notifyAdminBookPendingReview = async (input) => {
  const result = await createAdminNotification({
    type: "book_pending_review",
    title: "Book pending review",
    body: `"${input.title}" is waiting for approval.`,
    targetUrl: `/dashboard/admin/books/${input.bookId}`,
    actorUserId: input.actorUserId,
    isRead: false
  });
  if (result[0]) {
    console.error(
      "notifyAdminBookPendingReview failed:",
      result[0].reason,
      result[0]
    );
  }
  const siteUrl = process.env.SITE_URL ?? "https://photobookers.com";
  const reviewUrl = `${siteUrl}/dashboard/admin/books/${input.bookId}`;
  const subject = input.isResubmit ? `Book resubmitted for review: ${input.title}` : `New book submitted for review: ${input.title}`;
  const [emailError] = await sendAdminEmail(
    subject,
    generateBookPendingReviewEmail({
      bookTitle: input.title,
      reviewUrl,
      isResubmit: input.isResubmit
    })
  );
  if (emailError) {
    console.error(
      "notifyAdminBookPendingReview email failed:",
      emailError.reason,
      emailError
    );
  }
};
const notifyAdminFairAttendancePending = async (input) => {
  const result = await createAdminNotification({
    type: "fair_attendance_pending",
    title: "Fair attendance pending",
    body: `${input.creatorName} requested to attend "${input.fairName}".`,
    targetUrl: `/dashboard/admin/fairs/${input.fairId}#attendees`,
    actorUserId: input.actorUserId,
    isRead: false
  });
  if (result[0]) {
    console.error(
      "notifyAdminFairAttendancePending failed:",
      result[0].reason,
      result[0]
    );
  }
  const siteUrl = process.env.SITE_URL ?? "https://photobookers.com";
  const reviewUrl = `${siteUrl}/dashboard/admin/fairs/${input.fairId}#attendees`;
  const [emailError] = await sendAdminEmail(
    `Fair attendance pending: ${input.creatorName} at ${input.fairName}`,
    `<p>${input.creatorName} requested to attend <strong>${input.fairName}</strong>.</p><p><a href="${reviewUrl}">Review attendance</a></p>`
  );
  if (emailError) {
    console.error(
      "notifyAdminFairAttendancePending email failed:",
      emailError.reason,
      emailError
    );
  }
};
const getAdminNotifications = async (currentPage, defaultLimit = 30) => {
  try {
    const rows = await db.query.adminNotifications.findMany({
      orderBy: (t, { desc: desc2 }) => [desc2(t.createdAt)]
    });
    const totalCount = rows.length;
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit
    );
    return ok({
      notifications: rows.slice(offset, offset + limit),
      page,
      totalPages
    });
  } catch (error) {
    console.error("Failed to load admin notifications", error);
    return err({ reason: "Failed to load admin notifications", cause: error });
  }
};
const getUnreadAdminNotificationsCount = async () => {
  try {
    const [row] = await db.select({ value: count() }).from(adminNotifications).where(eq(adminNotifications.isRead, false));
    return ok(Number(row?.value ?? 0));
  } catch (error) {
    return err({
      reason: "Failed to count unread notifications",
      cause: error
    });
  }
};
const markAllAdminNotificationsRead = async () => {
  try {
    await db.update(adminNotifications).set({ isRead: true }).where(eq(adminNotifications.isRead, false));
    return ok(void 0);
  } catch (error) {
    return err({
      reason: "Failed to mark notifications as read",
      cause: error
    });
  }
};
const markAdminNotificationRead = async (id) => {
  try {
    await db.update(adminNotifications).set({ isRead: true }).where(eq(adminNotifications.id, id));
    return ok(void 0);
  } catch (error) {
    return err({ reason: "Failed to mark notification as read", cause: error });
  }
};
export {
  createAdminNotification,
  getAdminNotifications,
  getUnreadAdminNotificationsCount,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  notifyAdminBookPendingReview,
  notifyAdminFairAttendancePending
};
