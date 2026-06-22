import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../../../db/client";
import { bookFairs, fairAttendees } from "../../../db/schema";
import { getPagination } from "../../../lib/pagination";
import { err, ok } from "../../../lib/result";

const today = () => new Date(new Date().setHours(0, 0, 0, 0));

export const getUpcomingFairs = async (
  currentPage: number = 1,
  limit: number = 30,
) => {
  try {
    const publishedCondition = and(
      eq(bookFairs.status, "published"),
      eq(bookFairs.approvalStatus, "approved"),
      gte(bookFairs.startDate, today()),
    );

    const [{ value: totalCount = 0 }] = await db
      .select({ value: sql<number>`count(*)` })
      .from(bookFairs)
      .where(publishedCondition);

    const { page, limit: pageLimit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      limit,
    );

    const fairs = await db.query.bookFairs.findMany({
      where: publishedCondition,
      orderBy: [
        desc(bookFairs.listingTier),
        sql`${bookFairs.sortOrder} ASC NULLS LAST`,
        bookFairs.startDate,
      ],
      limit: pageLimit,
      offset: offset,
    });

    return ok({ fairs, totalPages, page });
  } catch (error) {
    console.error("Failed to get upcoming fairs", error);
    return err({ reason: "Failed to get upcoming fairs", cause: error });
  }
};

export const getPastFairs = async (
  currentPage: number = 1,
  limit: number = 30,
) => {
  try {
    const pastCondition = and(
      eq(bookFairs.status, "published"),
      eq(bookFairs.approvalStatus, "approved"),
      lte(bookFairs.endDate, today()),
    );

    const [{ value: totalCount = 0 }] = await db
      .select({ value: sql<number>`count(*)` })
      .from(bookFairs)
      .where(pastCondition);

    const { page, limit: pageLimit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      limit,
    );

    const fairs = await db.query.bookFairs.findMany({
      where: pastCondition,
      orderBy: [desc(bookFairs.endDate)],
      limit: pageLimit,
      offset: offset,
    });

    return ok({ fairs, totalPages, page });
  } catch (error) {
    console.error("Failed to get past fairs", error);
    return err({ reason: "Failed to get past fairs", cause: error });
  }
};

export const getFairBySlug = async (slug: string) => {
  try {
    const fair = await db.query.bookFairs.findFirst({
      where: eq(bookFairs.slug, slug),
      with: {
        attendees: {
          with: {
            creator: {
              columns: {
                id: true,
                displayName: true,
                slug: true,
                type: true,
                coverUrl: true,
                city: true,
                country: true,
                status: true,
              },
            },
          },
          orderBy: (fairAttendees, { asc }) => [
            asc(fairAttendees.createdAt),
          ],
        },
      },
    });

    if (!fair) return err({ reason: "Fair not found" });

    return ok(fair);
  } catch (error) {
    console.error("Failed to get fair by slug", error);
    return err({ reason: "Failed to get fair by slug", cause: error });
  }
};

export const getUpcomingFairsForCreator = async (
  creatorId: string,
  limit: number = 5,
) => {
  try {
    const attendances = await db.query.fairAttendees.findMany({
      where: eq(fairAttendees.creatorId, creatorId),
      with: {
        fair: true,
      },
    });

    const upcomingFairs = attendances
      .filter(
        (a) =>
          a.fair.status === "published" &&
          a.fair.approvalStatus === "approved" &&
          new Date(a.fair.startDate) >= today(),
      )
      .map((a) => a.fair)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, limit);

    return ok(upcomingFairs);
  } catch (error) {
    console.error("Failed to get upcoming fairs for creator", error);
    return err({
      reason: "Failed to get upcoming fairs for creator",
      cause: error,
    });
  }
};

export const getFairsByCreatorId = async (
  creatorId: string,
  currentPage: number = 1,
  limit: number = 30,
) => {
  try {
    const attendances = await db.query.fairAttendees.findMany({
      where: eq(fairAttendees.creatorId, creatorId),
      with: {
        fair: true,
      },
    });

    const allFairs = attendances
      .filter(
        (a) =>
          a.fair.status === "published" &&
          a.fair.approvalStatus === "approved",
      )
      .map((a) => a.fair)
      .sort((a, b) => {
        const aIsFuture = new Date(a.startDate) >= today();
        const bIsFuture = new Date(b.startDate) >= today();
        
        if (aIsFuture && !bIsFuture) return -1;
        if (!aIsFuture && bIsFuture) return 1;
        
        if (aIsFuture) {
          return a.startDate.getTime() - b.startDate.getTime();
        } else {
          return b.endDate.getTime() - a.endDate.getTime();
        }
      });

    const { page, limit: pageLimit, offset, totalPages } = getPagination(
      currentPage,
      allFairs.length,
      limit,
    );

    const fairs = allFairs.slice(offset, offset + pageLimit);

    return ok({ fairs, totalPages, page });
  } catch (error) {
    console.error("Failed to get fairs by creator", error);
    return err({ reason: "Failed to get fairs by creator", cause: error });
  }
};
