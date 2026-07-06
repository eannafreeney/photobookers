import {
  and,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  lte,
  or,
  sql
} from "drizzle-orm";
import { db } from "../../../db/client.js";
import { bookFairs, creators, fairAttendees } from "../../../db/schema.js";
import { getPagination } from "../../../lib/pagination.js";
import { err, ok } from "../../../lib/result.js";
const today = () => new Date((/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0));
const buildFairSearchCondition = (query) => {
  const searchPattern = `%${query.trim()}%`;
  const matchingFairIdsByParticipant = db.select({ id: fairAttendees.fairId }).from(fairAttendees).innerJoin(creators, eq(fairAttendees.creatorId, creators.id)).where(
    and(
      eq(fairAttendees.status, "approved"),
      ilike(creators.displayName, searchPattern)
    )
  );
  return or(
    ilike(bookFairs.name, searchPattern),
    ilike(bookFairs.city, searchPattern),
    ilike(bookFairs.country, searchPattern),
    ilike(bookFairs.venue, searchPattern),
    inArray(bookFairs.id, matchingFairIdsByParticipant)
  );
};
const getUpcomingFairs = async (currentPage = 1, limit = 30) => {
  try {
    const publishedCondition = and(
      eq(bookFairs.status, "published"),
      eq(bookFairs.approvalStatus, "approved"),
      gt(bookFairs.startDate, today())
    );
    const [{ value: totalCount = 0 }] = await db.select({ value: sql`count(*)` }).from(bookFairs).where(publishedCondition);
    const { page, limit: pageLimit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      limit
    );
    const fairs = await db.query.bookFairs.findMany({
      where: publishedCondition,
      orderBy: [
        desc(bookFairs.listingTier),
        sql`${bookFairs.sortOrder} ASC NULLS LAST`,
        bookFairs.startDate
      ],
      limit: pageLimit,
      offset
    });
    return ok({ fairs, totalPages, page });
  } catch (error) {
    console.error("Failed to get upcoming fairs", error);
    return err({ reason: "Failed to get upcoming fairs", cause: error });
  }
};
const getPastFairs = async (currentPage = 1, limit = 30) => {
  try {
    const pastCondition = and(
      eq(bookFairs.status, "published"),
      eq(bookFairs.approvalStatus, "approved"),
      lte(bookFairs.endDate, today())
    );
    const [{ value: totalCount = 0 }] = await db.select({ value: sql`count(*)` }).from(bookFairs).where(pastCondition);
    const { page, limit: pageLimit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      limit
    );
    const fairs = await db.query.bookFairs.findMany({
      where: pastCondition,
      orderBy: [desc(bookFairs.endDate)],
      limit: pageLimit,
      offset
    });
    return ok({ fairs, totalPages, page });
  } catch (error) {
    console.error("Failed to get past fairs", error);
    return err({ reason: "Failed to get past fairs", cause: error });
  }
};
const getCurrentFairs = async (currentPage = 1, limit = 30) => {
  try {
    const now = today();
    const currentCondition = and(
      eq(bookFairs.status, "published"),
      eq(bookFairs.approvalStatus, "approved"),
      lte(bookFairs.startDate, now),
      gte(bookFairs.endDate, now)
    );
    const [{ value: totalCount = 0 }] = await db.select({ value: sql`count(*)` }).from(bookFairs).where(currentCondition);
    const { page, limit: pageLimit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      limit
    );
    const fairs = await db.query.bookFairs.findMany({
      where: currentCondition,
      orderBy: [
        desc(bookFairs.listingTier),
        sql`${bookFairs.sortOrder} ASC NULLS LAST`,
        bookFairs.startDate
      ],
      limit: pageLimit,
      offset
    });
    return ok({ fairs, totalPages, page });
  } catch (error) {
    console.error("Failed to get current fairs", error);
    return err({ reason: "Failed to get current fairs", cause: error });
  }
};
const getFairBySlug = async (slug) => {
  try {
    const fair = await db.query.bookFairs.findFirst({
      where: eq(bookFairs.slug, slug)
    });
    if (!fair) return err({ reason: "Fair not found" });
    return ok(fair);
  } catch (error) {
    console.error("Failed to get fair by slug", error);
    return err({ reason: "Failed to get fair by slug", cause: error });
  }
};
const getUpcomingFairsForCreator = async (creatorId, limit = 5) => {
  try {
    const attendances = await db.query.fairAttendees.findMany({
      where: eq(fairAttendees.creatorId, creatorId),
      with: {
        fair: true
      }
    });
    const upcomingFairs = attendances.filter(
      (a) => a.status === "approved" && a.fair.status === "published" && a.fair.approvalStatus === "approved" && new Date(a.fair.startDate) >= today()
    ).map((a) => a.fair).sort((a, b) => a.startDate.getTime() - b.startDate.getTime()).slice(0, limit);
    return ok(upcomingFairs);
  } catch (error) {
    console.error("Failed to get upcoming fairs for creator", error);
    return err({
      reason: "Failed to get upcoming fairs for creator",
      cause: error
    });
  }
};
const getFairsByCreatorId = async (creatorId, currentPage = 1, limit = 30) => {
  try {
    const attendances = await db.query.fairAttendees.findMany({
      where: eq(fairAttendees.creatorId, creatorId),
      with: {
        fair: true
      }
    });
    const allFairs = attendances.filter(
      (a) => a.status === "approved" && a.fair.status === "published" && a.fair.approvalStatus === "approved"
    ).map((a) => a.fair).sort((a, b) => {
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
      limit
    );
    const fairs = allFairs.slice(offset, offset + pageLimit);
    return ok({ fairs, totalPages, page });
  } catch (error) {
    console.error("Failed to get fairs by creator", error);
    return err({ reason: "Failed to get fairs by creator", cause: error });
  }
};
const getFairsByMonth = async (year, month) => {
  try {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    const publishedCondition = and(
      eq(bookFairs.status, "published"),
      eq(bookFairs.approvalStatus, "approved"),
      // Fair is in month if it starts before month ends AND ends after month starts
      lte(bookFairs.startDate, endOfMonth),
      gte(bookFairs.endDate, startOfMonth)
    );
    const fairs = await db.query.bookFairs.findMany({
      where: publishedCondition,
      orderBy: [bookFairs.startDate]
    });
    return ok(fairs);
  } catch (error) {
    console.error("Failed to get fairs by month", error);
    return err({ reason: "Failed to get fairs by month", cause: error });
  }
};
const searchFairs = async (params) => {
  try {
    const {
      query,
      city,
      country,
      startDate,
      endDate,
      page = 1,
      limit = 30
    } = params;
    const conditions = [
      eq(bookFairs.status, "published"),
      eq(bookFairs.approvalStatus, "approved")
    ];
    if (query && query.trim()) {
      conditions.push(buildFairSearchCondition(query));
    }
    if (city && city.trim()) {
      conditions.push(ilike(bookFairs.city, `%${city.trim()}%`));
    }
    if (country && country.trim()) {
      conditions.push(ilike(bookFairs.country, `%${country.trim()}%`));
    }
    if (startDate) {
      conditions.push(gte(bookFairs.startDate, startDate));
    }
    if (endDate) {
      conditions.push(lte(bookFairs.endDate, endDate));
    }
    const whereCondition = and(...conditions);
    const [{ value: totalCount = 0 }] = await db.select({ value: sql`count(*)` }).from(bookFairs).where(whereCondition);
    const { page: currentPage, limit: pageLimit, offset, totalPages } = getPagination(
      page,
      totalCount,
      limit
    );
    const fairs = await db.query.bookFairs.findMany({
      where: whereCondition,
      orderBy: [
        desc(bookFairs.listingTier),
        sql`${bookFairs.sortOrder} ASC NULLS LAST`,
        bookFairs.startDate
      ],
      limit: pageLimit,
      offset
    });
    return ok({ fairs, totalPages, page: currentPage, totalCount });
  } catch (error) {
    console.error("Failed to search fairs", error);
    return err({ reason: "Failed to search fairs", cause: error });
  }
};
const searchFairsForNav = async (searchTerm, limit = 5) => {
  try {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return ok([]);
    }
    const conditions = [
      eq(bookFairs.status, "published"),
      eq(bookFairs.approvalStatus, "approved"),
      buildFairSearchCondition(searchTerm)
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
        country: true
      },
      orderBy: [
        desc(bookFairs.listingTier),
        bookFairs.startDate
      ],
      limit
    });
    return ok(fairs);
  } catch (error) {
    console.error("Failed to search fairs for nav", error);
    return err({ reason: "Failed to search fairs for nav", cause: error });
  }
};
export {
  getCurrentFairs,
  getFairBySlug,
  getFairsByCreatorId,
  getFairsByMonth,
  getPastFairs,
  getUpcomingFairs,
  getUpcomingFairsForCreator,
  searchFairs,
  searchFairsForNav
};
