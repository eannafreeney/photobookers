import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "../../../../db/client.js";
import {
  bookFairs,
  creators,
  fairAttendees
} from "../../../../db/schema.js";
import { getPagination } from "../../../../lib/pagination.js";
import { err, ok } from "../../../../lib/result.js";
const getAllFairsAdmin = async (currentPage = 1, searchQuery, status) => {
  try {
    const searchCondition = searchQuery && searchQuery.trim() !== "" ? or(
      ilike(bookFairs.name, `%${searchQuery}%`),
      ilike(bookFairs.city, `%${searchQuery}%`),
      ilike(bookFairs.country, `%${searchQuery}%`)
    ) : void 0;
    const statusCondition = status ? eq(bookFairs.status, status) : void 0;
    const whereCondition = searchCondition && statusCondition ? and(searchCondition, statusCondition) : searchCondition ?? statusCondition ?? void 0;
    const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(bookFairs).where(whereCondition);
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      30
    );
    const foundFairs = await db.query.bookFairs.findMany({
      where: whereCondition,
      orderBy: [desc(bookFairs.startDate), desc(bookFairs.createdAt)],
      limit,
      offset,
      with: {
        createdBy: {
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    return ok({ fairs: foundFairs, totalPages, page });
  } catch (error) {
    console.error("Failed to get all fairs", error);
    return err({ reason: "Failed to get all fairs", cause: error });
  }
};
const getFairByIdAdmin = async (fairId) => {
  try {
    const fair = await db.query.bookFairs.findFirst({
      where: eq(bookFairs.id, fairId),
      with: {
        createdBy: {
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        attendees: {
          with: {
            creator: {
              columns: {
                id: true,
                displayName: true,
                slug: true,
                type: true,
                coverUrl: true
              }
            }
          }
        }
      }
    });
    if (!fair) return err({ reason: "Fair not found" });
    return ok(fair);
  } catch (error) {
    console.error("Failed to get fair by ID", error);
    return err({ reason: "Failed to get fair by ID", cause: error });
  }
};
const createFairAdmin = async (fairData, userId) => {
  try {
    const [newFair] = await db.insert(bookFairs).values({
      ...fairData,
      createdByUserId: userId,
      approvalStatus: "approved"
    }).returning();
    if (!newFair) return err({ reason: "Failed to create fair" });
    return ok(newFair);
  } catch (error) {
    console.error("Failed to create fair", error);
    return err({ reason: "Failed to create fair", cause: error });
  }
};
const updateFairAdmin = async (fairId, updates) => {
  try {
    const [updatedFair] = await db.update(bookFairs).set(updates).where(eq(bookFairs.id, fairId)).returning();
    if (!updatedFair) return err({ reason: "Fair not found" });
    return ok(updatedFair);
  } catch (error) {
    console.error("Failed to update fair", error);
    return err({ reason: "Failed to update fair", cause: error });
  }
};
const deleteFairByIdAdmin = async (fairId) => {
  try {
    const [deletedFair] = await db.delete(bookFairs).where(eq(bookFairs.id, fairId)).returning();
    if (!deletedFair) return err({ reason: "Fair not found" });
    return ok(deletedFair);
  } catch (error) {
    console.error("Failed to delete fair", error);
    return err({ reason: "Failed to delete fair", cause: error });
  }
};
const approveFair = async (fairId) => {
  try {
    const [updatedFair] = await db.update(bookFairs).set({ approvalStatus: "approved" }).where(eq(bookFairs.id, fairId)).returning();
    if (!updatedFair) return err({ reason: "Fair not found" });
    return ok(updatedFair);
  } catch (error) {
    console.error("Failed to approve fair", error);
    return err({ reason: "Failed to approve fair", cause: error });
  }
};
const rejectFair = async (fairId, feedback) => {
  try {
    const [updatedFair] = await db.update(bookFairs).set({ approvalStatus: "rejected", status: "draft" }).where(eq(bookFairs.id, fairId)).returning();
    if (!updatedFair) return err({ reason: "Fair not found" });
    return ok(updatedFair);
  } catch (error) {
    console.error("Failed to reject fair", error);
    return err({ reason: "Failed to reject fair", cause: error });
  }
};
const getAttendeesForFair = async (fairId) => {
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
            coverUrl: true
          }
        }
      },
      orderBy: (fairAttendees2, { asc }) => [asc(fairAttendees2.createdAt)]
    });
    return ok(attendees);
  } catch (error) {
    console.error("Failed to get attendees for fair", error);
    return err({ reason: "Failed to get attendees for fair", cause: error });
  }
};
const addAttendeeToFair = async (fairId, creatorId) => {
  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.id, creatorId)
    });
    if (!creator) {
      return err({ reason: "Creator not found" });
    }
    const [attendee] = await db.insert(fairAttendees).values({
      fairId,
      creatorId,
      status: "approved"
    }).returning();
    if (!attendee) return err({ reason: "Failed to add attendee" });
    return ok(attendee);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      return err({ reason: "Creator is already an attendee at this fair" });
    }
    console.error("Failed to add attendee to fair", error);
    return err({ reason: "Failed to add attendee to fair", cause: error });
  }
};
const addAttendeesToFair = async (fairId, creatorIds) => {
  const uniqueCreatorIds = [...new Set(creatorIds)];
  let addedCount = 0;
  let skippedCount = 0;
  let lastError = null;
  for (const creatorId of uniqueCreatorIds) {
    const [error] = await addAttendeeToFair(fairId, creatorId);
    if (error) {
      if (error.reason === "Creator is already an attendee at this fair") {
        skippedCount += 1;
      } else {
        lastError = error;
      }
      continue;
    }
    addedCount += 1;
  }
  if (addedCount === 0) {
    if (skippedCount > 0) {
      return err({ reason: "Selected creators are already attendees" });
    }
    return err(lastError ?? { reason: "Failed to add attendees" });
  }
  return ok({ addedCount, skippedCount });
};
const removeAttendeeFromFair = async (fairId, creatorId) => {
  try {
    const [deleted] = await db.delete(fairAttendees).where(
      and(
        eq(fairAttendees.fairId, fairId),
        eq(fairAttendees.creatorId, creatorId)
      )
    ).returning();
    if (!deleted) return err({ reason: "Attendee not found" });
    return ok(deleted);
  } catch (error) {
    console.error("Failed to remove attendee from fair", error);
    return err({ reason: "Failed to remove attendee from fair", cause: error });
  }
};
const getAllCreatorOptionsForFairs = async () => {
  try {
    const allCreators = await db.query.creators.findMany({
      columns: {
        id: true,
        displayName: true,
        type: true,
        slug: true,
        coverUrl: true
      },
      orderBy: (creators2, { asc }) => [asc(creators2.displayName)]
    });
    const options = allCreators.map((c) => ({
      id: c.id,
      label: `${c.displayName} (${c.type})`,
      img: c.coverUrl
    }));
    return ok(options);
  } catch (error) {
    console.error("Failed to get creator options", error);
    return err({ reason: "Failed to get creator options", cause: error });
  }
};
export {
  addAttendeeToFair,
  addAttendeesToFair,
  approveFair,
  createFairAdmin,
  deleteFairByIdAdmin,
  getAllCreatorOptionsForFairs,
  getAllFairsAdmin,
  getAttendeesForFair,
  getFairByIdAdmin,
  rejectFair,
  removeAttendeeFromFair,
  updateFairAdmin
};
