import { and, eq } from "drizzle-orm";
import { db } from "../../db/client";
import { bookFairs, fairAttendees } from "../../db/schema";
import { err, ok } from "../../lib/result";

const today = () => new Date(new Date().setHours(0, 0, 0, 0));

const isFairOpenForAttendance = (fair: {
  status: string;
  approvalStatus: string;
  endDate: Date;
}) =>
  fair.status === "published" &&
  fair.approvalStatus === "approved" &&
  new Date(fair.endDate) >= today();

export const getAttendanceForCreator = async (
  fairId: string,
  creatorId: string,
) => {
  try {
    const attendee = await db.query.fairAttendees.findFirst({
      where: and(
        eq(fairAttendees.fairId, fairId),
        eq(fairAttendees.creatorId, creatorId),
      ),
    });

    return ok(attendee ?? null);
  } catch (error) {
    console.error("Failed to get attendance for creator", error);
    return err({
      reason: "Failed to get attendance for creator",
      cause: error,
    });
  }
};

export const requestFairAttendance = async (
  fairId: string,
  creatorId: string,
) => {
  try {
    const fair = await db.query.bookFairs.findFirst({
      where: eq(bookFairs.id, fairId),
    });

    if (!fair) return err({ reason: "Fair not found" });

    if (!isFairOpenForAttendance(fair)) {
      return err({ reason: "This fair is no longer accepting attendance claims" });
    }

    const existing = await db.query.fairAttendees.findFirst({
      where: and(
        eq(fairAttendees.fairId, fairId),
        eq(fairAttendees.creatorId, creatorId),
      ),
    });

    if (existing) {
      if (existing.status === "pending") {
        return err({ reason: "Your attendance is already pending approval" });
      }
      if (existing.status === "approved") {
        return err({ reason: "You are already attending this fair" });
      }
      if (existing.status === "rejected") {
        return err({ reason: "Your attendance request was not approved" });
      }
    }

    const [attendee] = await db
      .insert(fairAttendees)
      .values({
        fairId,
        creatorId,
        status: "pending",
      })
      .returning();

    if (!attendee) return err({ reason: "Failed to request attendance" });

    return ok(attendee);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505"
    ) {
      return err({ reason: "You have already requested attendance at this fair" });
    }
    console.error("Failed to request fair attendance", error);
    return err({ reason: "Failed to request attendance", cause: error });
  }
};

export const withdrawFairAttendance = async (
  fairId: string,
  creatorId: string,
) => {
  try {
    const fair = await db.query.bookFairs.findFirst({
      where: eq(bookFairs.id, fairId),
    });

    if (!fair) return err({ reason: "Fair not found" });

    if (new Date(fair.endDate) < today()) {
      return err({ reason: "This fair has ended" });
    }

    const [deleted] = await db
      .delete(fairAttendees)
      .where(
        and(
          eq(fairAttendees.fairId, fairId),
          eq(fairAttendees.creatorId, creatorId),
        ),
      )
      .returning();

    if (!deleted) return err({ reason: "Attendance record not found" });

    return ok(deleted);
  } catch (error) {
    console.error("Failed to withdraw fair attendance", error);
    return err({ reason: "Failed to withdraw attendance", cause: error });
  }
};

export const approveFairAttendee = async (attendeeId: string) => {
  try {
    const [updated] = await db
      .update(fairAttendees)
      .set({ status: "approved" })
      .where(eq(fairAttendees.id, attendeeId))
      .returning();

    if (!updated) return err({ reason: "Attendee not found" });

    return ok(updated);
  } catch (error) {
    console.error("Failed to approve fair attendee", error);
    return err({ reason: "Failed to approve attendee", cause: error });
  }
};

export const rejectFairAttendee = async (attendeeId: string) => {
  try {
    const [updated] = await db
      .update(fairAttendees)
      .set({ status: "rejected" })
      .where(eq(fairAttendees.id, attendeeId))
      .returning();

    if (!updated) return err({ reason: "Attendee not found" });

    return ok(updated);
  } catch (error) {
    console.error("Failed to reject fair attendee", error);
    return err({ reason: "Failed to reject attendee", cause: error });
  }
};
