import { and, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
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

export const getCurrentFairs = async (
  currentPage: number = 1,
  limit: number = 30,
) => {
  try {
    const now = today();
    const currentCondition = and(
      eq(bookFairs.status, "published"),
      eq(bookFairs.approvalStatus, "approved"),
      lte(bookFairs.startDate, now),
      gte(bookFairs.endDate, now),
    );

    const [{ value: totalCount = 0 }] = await db
      .select({ value: sql<number>`count(*)` })
      .from(bookFairs)
      .where(currentCondition);

    const { page, limit: pageLimit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      limit,
    );

    const fairs = await db.query.bookFairs.findMany({
      where: currentCondition,
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
    console.error("Failed to get current fairs", error);
    return err({ reason: "Failed to get current fairs", cause: error });
  }
};

export const getFairBySlug = async (slug: string) => {
  try {
    const fair = await db.query.bookFairs.findFirst({
      where: eq(bookFairs.slug, slug),
      with: {
        attendees: {
          where: eq(fairAttendees.status, "approved"),
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
          a.status === "approved" &&
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
          a.status === "approved" &&
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

export const getFairsByMonth = async (year: number, month: number) => {
  try {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const publishedCondition = and(
      eq(bookFairs.status, "published"),
      eq(bookFairs.approvalStatus, "approved"),
      // Fair is in month if it starts before month ends AND ends after month starts
      lte(bookFairs.startDate, endOfMonth),
      gte(bookFairs.endDate, startOfMonth),
    );

    const fairs = await db.query.bookFairs.findMany({
      where: publishedCondition,
      orderBy: [bookFairs.startDate],
    });

    return ok(fairs);
  } catch (error) {
    console.error("Failed to get fairs by month", error);
    return err({ reason: "Failed to get fairs by month", cause: error });
  }
};

export type FairSearchParams = {
  query?: string;
  city?: string;
  country?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
};

export const searchFairs = async (params: FairSearchParams) => {
  try {
    const {
      query,
      city,
      country,
      startDate,
      endDate,
      page = 1,
      limit = 30,
    } = params;

    const conditions = [
      eq(bookFairs.status, "published"),
      eq(bookFairs.approvalStatus, "approved"),
    ];

    // Text search (name, description, venue)
    if (query && query.trim()) {
      const searchTerm = `%${query.trim()}%`;
      conditions.push(
        or(
          ilike(bookFairs.name, searchTerm),
          ilike(bookFairs.description, searchTerm),
          ilike(bookFairs.venue, searchTerm),
        )!,
      );
    }

    // Location filters
    if (city && city.trim()) {
      conditions.push(ilike(bookFairs.city, `%${city.trim()}%`));
    }

    if (country && country.trim()) {
      conditions.push(ilike(bookFairs.country, `%${country.trim()}%`));
    }

    // Date range filters
    if (startDate) {
      conditions.push(gte(bookFairs.startDate, startDate));
    }

    if (endDate) {
      conditions.push(lte(bookFairs.endDate, endDate));
    }

    const whereCondition = and(...conditions);

    const [{ value: totalCount = 0 }] = await db
      .select({ value: sql<number>`count(*)` })
      .from(bookFairs)
      .where(whereCondition);

    const { page: currentPage, limit: pageLimit, offset, totalPages } = getPagination(
      page,
      totalCount,
      limit,
    );

    const fairs = await db.query.bookFairs.findMany({
      where: whereCondition,
      orderBy: [
        desc(bookFairs.listingTier),
        sql`${bookFairs.sortOrder} ASC NULLS LAST`,
        bookFairs.startDate,
      ],
      limit: pageLimit,
      offset: offset,
    });

    return ok({ fairs, totalPages, page: currentPage, totalCount });
  } catch (error) {
    console.error("Failed to search fairs", error);
    return err({ reason: "Failed to search fairs", cause: error });
  }
};

export const searchFairsForNav = async (
  searchTerm: string,
  limit: number = 5,
) => {
  try {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return ok([]);
    }

    const searchPattern = `%${searchTerm.trim()}%`;
    const conditions = [
      eq(bookFairs.status, "published"),
      eq(bookFairs.approvalStatus, "approved"),
      or(
        ilike(bookFairs.name, searchPattern),
        ilike(bookFairs.description, searchPattern),
        ilike(bookFairs.city, searchPattern),
        ilike(bookFairs.venue, searchPattern),
      )!,
    ];

    const fairs = await db.query.bookFairs.findMany({
      where: and(...conditions),
      columns: {
        id: true,
        slug: true,
        name: true,
        coverUrl: true,
        startDate: true,
        endDate: true,
        city: true,
        country: true,
      },
      orderBy: [
        desc(bookFairs.listingTier),
        bookFairs.startDate,
      ],
      limit,
    });

    return ok(fairs);
  } catch (error) {
    console.error("Failed to search fairs for nav", error);
    return err({ reason: "Failed to search fairs for nav", cause: error });
  }
};
