import { and, count, desc, eq, gte, ilike, lte, or } from "drizzle-orm";
import { db } from "../../../../db/client";
import {
  bookFairs,
  creators,
  fairAttendees,
  type NewBookFair,
  type UpdateBookFair,
} from "../../../../db/schema";
import { getPagination } from "../../../../lib/pagination";
import { err, ok } from "../../../../lib/result";

export const getAllFairsAdmin = async (
  currentPage: number = 1,
  searchQuery?: string,
  status?: "draft" | "published" | "cancelled" | undefined,
) => {
  try {
    const searchCondition =
      searchQuery && searchQuery.trim() !== ""
        ? or(
            ilike(bookFairs.name, `%${searchQuery}%`),
            ilike(bookFairs.city, `%${searchQuery}%`),
            ilike(bookFairs.country, `%${searchQuery}%`),
          )
        : undefined;

    const statusCondition = status
      ? eq(bookFairs.status, status)
      : undefined;

    const whereCondition =
      searchCondition && statusCondition
        ? and(searchCondition, statusCondition)
        : (searchCondition ?? statusCondition ?? undefined);

    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(bookFairs)
      .where(whereCondition);

    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      30,
    );

    const foundFairs = await db.query.bookFairs.findMany({
      where: whereCondition,
      orderBy: [desc(bookFairs.startDate), desc(bookFairs.createdAt)],
      limit: limit,
      offset: offset,
      with: {
        createdBy: {
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return ok({ fairs: foundFairs, totalPages, page });
  } catch (error) {
    console.error("Failed to get all fairs", error);
    return err({ reason: "Failed to get all fairs", cause: error });
  }
};

export const getFairByIdAdmin = async (fairId: string) => {
  try {
    const fair = await db.query.bookFairs.findFirst({
      where: eq(bookFairs.id, fairId),
      with: {
        createdBy: {
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        attendees: {
          with: {
            creator: {
              columns: {
                id: true,
                displayName: true,
                slug: true,
                type: true,
                coverUrl: true,
              },
            },
          },
        },
      },
    });

    if (!fair) return err({ reason: "Fair not found" });

    return ok(fair);
  } catch (error) {
    console.error("Failed to get fair by ID", error);
    return err({ reason: "Failed to get fair by ID", cause: error });
  }
};

export const createFairAdmin = async (
  fairData: Omit<NewBookFair, "createdByUserId" | "approvalStatus">,
  userId: string,
) => {
  try {
    const [newFair] = await db
      .insert(bookFairs)
      .values({
        ...fairData,
        createdByUserId: userId,
        approvalStatus: "approved",
      })
      .returning();

    if (!newFair) return err({ reason: "Failed to create fair" });

    return ok(newFair);
  } catch (error) {
    console.error("Failed to create fair", error);
    return err({ reason: "Failed to create fair", cause: error });
  }
};

export const updateFairAdmin = async (
  fairId: string,
  updates: UpdateBookFair,
) => {
  try {
    const [updatedFair] = await db
      .update(bookFairs)
      .set(updates)
      .where(eq(bookFairs.id, fairId))
      .returning();

    if (!updatedFair) return err({ reason: "Fair not found" });

    return ok(updatedFair);
  } catch (error) {
    console.error("Failed to update fair", error);
    return err({ reason: "Failed to update fair", cause: error });
  }
};

export const deleteFairByIdAdmin = async (fairId: string) => {
  try {
    const [deletedFair] = await db
      .delete(bookFairs)
      .where(eq(bookFairs.id, fairId))
      .returning();

    if (!deletedFair) return err({ reason: "Fair not found" });

    return ok(deletedFair);
  } catch (error) {
    console.error("Failed to delete fair", error);
    return err({ reason: "Failed to delete fair", cause: error });
  }
};

export const approveFair = async (fairId: string) => {
  try {
    const [updatedFair] = await db
      .update(bookFairs)
      .set({ approvalStatus: "approved" })
      .where(eq(bookFairs.id, fairId))
      .returning();

    if (!updatedFair) return err({ reason: "Fair not found" });

    return ok(updatedFair);
  } catch (error) {
    console.error("Failed to approve fair", error);
    return err({ reason: "Failed to approve fair", cause: error });
  }
};

export const rejectFair = async (fairId: string, feedback?: string) => {
  try {
    const [updatedFair] = await db
      .update(bookFairs)
      .set({ approvalStatus: "rejected", status: "draft" })
      .where(eq(bookFairs.id, fairId))
      .returning();

    if (!updatedFair) return err({ reason: "Fair not found" });

    return ok(updatedFair);
  } catch (error) {
    console.error("Failed to reject fair", error);
    return err({ reason: "Failed to reject fair", cause: error });
  }
};

export const getAttendeesForFair = async (fairId: string) => {
  try {
    const attendees = await db.query.fairAttendees.findMany({
      where: eq(fairAttendees.fairId, fairId),
      with: {
        creator: {
          columns: {
            id: true,
            displayName: true,
            slug: true,
            type: true,
            coverUrl: true,
          },
        },
      },
      orderBy: (fairAttendees, { asc }) => [asc(fairAttendees.createdAt)],
    });

    return ok(attendees);
  } catch (error) {
    console.error("Failed to get attendees for fair", error);
    return err({ reason: "Failed to get attendees for fair", cause: error });
  }
};

export const addAttendeeToFair = async (
  fairId: string,
  creatorId: string,
) => {
  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.id, creatorId),
    });

    if (!creator) {
      return err({ reason: "Creator not found" });
    }

    const [attendee] = await db
      .insert(fairAttendees)
      .values({
        fairId,
        creatorId,
        status: "approved",
      })
      .returning();

    if (!attendee) return err({ reason: "Failed to add attendee" });

    return ok(attendee);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505"
    ) {
      return err({ reason: "Creator is already an attendee at this fair" });
    }
    console.error("Failed to add attendee to fair", error);
    return err({ reason: "Failed to add attendee to fair", cause: error });
  }
};

export const removeAttendeeFromFair = async (
  fairId: string,
  creatorId: string,
) => {
  try {
    const [deleted] = await db
      .delete(fairAttendees)
      .where(
        and(
          eq(fairAttendees.fairId, fairId),
          eq(fairAttendees.creatorId, creatorId),
        ),
      )
      .returning();

    if (!deleted) return err({ reason: "Attendee not found" });

    return ok(deleted);
  } catch (error) {
    console.error("Failed to remove attendee from fair", error);
    return err({ reason: "Failed to remove attendee from fair", cause: error });
  }
};

export const getAllCreatorOptionsForFairs = async () => {
  try {
    const allCreators = await db.query.creators.findMany({
      columns: {
        id: true,
        displayName: true,
        type: true,
        slug: true,
      },
      orderBy: (creators, { asc }) => [asc(creators.displayName)],
    });

    return ok(
      allCreators.map((c) => ({
        id: c.id,
        label: `${c.displayName} (${c.type})`,
      })),
    );
  } catch (error) {
    console.error("Failed to get creator options", error);
    return err({ reason: "Failed to get creator options", cause: error });
  }
};
