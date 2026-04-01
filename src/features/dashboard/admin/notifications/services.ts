import { count, desc, eq } from "drizzle-orm";
import { db } from "../../../../db/client";
import {
  adminNotifications,
  NewAdminNotification,
} from "../../../../db/schema";
import { getPagination } from "../../../../lib/pagination";
import { err, ok } from "../../../../lib/result";

export const createAdminNotification = async (input: NewAdminNotification) => {
  try {
    const [row] = await db.insert(adminNotifications).values(input).returning();
    return ok(row);
  } catch (error) {
    console.error("Failed to create admin notification", error);
    return err({ reason: "Failed to create admin notification", cause: error });
  }
};

export const getAdminNotifications = async (
  currentPage: number,
  defaultLimit = 30,
) => {
  try {
    const rows = await db.query.adminNotifications.findMany({
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    });

    const totalCount = rows.length;
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit,
    );

    return ok({
      notifications: rows.slice(offset, offset + limit),
      page,
      totalPages,
    });
  } catch (error) {
    console.error("Failed to load admin notifications", error);
    return err({ reason: "Failed to load admin notifications", cause: error });
  }
};

export const getUnreadAdminNotificationsCount = async () => {
  try {
    const [row] = await db
      .select({ value: count() })
      .from(adminNotifications)
      .where(eq(adminNotifications.isRead, false));
    return ok(Number(row?.value ?? 0));
  } catch (error) {
    return err({
      reason: "Failed to count unread notifications",
      cause: error,
    });
  }
};
export const markAllAdminNotificationsRead = async () => {
  try {
    await db
      .update(adminNotifications)
      .set({ isRead: true })
      .where(eq(adminNotifications.isRead, false));
    return ok(undefined);
  } catch (error) {
    return err({
      reason: "Failed to mark notifications as read",
      cause: error,
    });
  }
};
export const markAdminNotificationRead = async (id: string) => {
  try {
    await db
      .update(adminNotifications)
      .set({ isRead: true })
      .where(eq(adminNotifications.id, id));
    return ok(undefined);
  } catch (error) {
    return err({ reason: "Failed to mark notification as read", cause: error });
  }
};
