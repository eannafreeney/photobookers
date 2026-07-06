import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  creatorViews,
  creators
} from "../../db/schema.js";
import {
  buildCreatedAtFilter
} from "../book-analytics/dateRange.js";
import { err, ok } from "../../lib/result.js";
import {
  CREATOR_CARD_COLUMNS
} from "../../constants/queries.js";
import { getPagination } from "../../lib/pagination.js";
const MAX_REFERER_LENGTH = 512;
const recordCreatorView = async ({
  creatorId,
  userId,
  source = "web",
  referer
}) => {
  try {
    const trimmedReferer = referer?.trim().slice(0, MAX_REFERER_LENGTH) ?? null;
    await db.insert(creatorViews).values({
      creatorId,
      userId: userId ?? null,
      source,
      referer: trimmedReferer
    });
    return ok(void 0);
  } catch (error) {
    console.error("Failed to record creator view", error);
    return err({ reason: "Failed to record creator view", cause: error });
  }
};
function countViewsForCreatorType(type, dateFilter) {
  const typeFilter = eq(creators.type, type);
  const where = dateFilter ? and(typeFilter, dateFilter) : typeFilter;
  return db.select({ value: count() }).from(creatorViews).innerJoin(creators, eq(creatorViews.creatorId, creators.id)).where(where);
}
const getCreatorProfileViewTotal = async (creatorId) => {
  const result = await db.select({ value: count() }).from(creatorViews).where(eq(creatorViews.creatorId, creatorId));
  return result[0]?.value ?? 0;
};
const getCreatorViewTotals = async (range) => {
  const dateFilter = buildCreatedAtFilter(creatorViews.createdAt, range);
  const [publisherViewsResult, artistViewsResult] = await Promise.all([
    countViewsForCreatorType("publisher", dateFilter),
    countViewsForCreatorType("artist", dateFilter)
  ]);
  return {
    publisherPageViews: publisherViewsResult[0]?.value ?? 0,
    artistPageViews: artistViewsResult[0]?.value ?? 0
  };
};
function topCreatorsByViewsWhere(creatorScope, dateFilter) {
  const typeFilter = creatorScope ? eq(creators.type, creatorScope) : void 0;
  if (typeFilter && dateFilter) return and(typeFilter, dateFilter);
  return typeFilter ?? dateFilter;
}
async function getTopCreatorsByViews(rangeOrLimit, currentPage, limitOrScope = 10, scope) {
  try {
    const paginate = currentPage !== void 0;
    let limit;
    let creatorScope;
    let range;
    if (paginate) {
      range = typeof rangeOrLimit === "number" ? null : rangeOrLimit;
      limit = typeof limitOrScope === "number" ? limitOrScope : 10;
      creatorScope = typeof limitOrScope === "string" ? limitOrScope : scope ?? null;
    } else if (typeof rangeOrLimit === "number") {
      range = null;
      limit = rangeOrLimit;
      creatorScope = null;
    } else {
      range = rangeOrLimit;
      limit = typeof limitOrScope === "number" ? limitOrScope : 10;
      creatorScope = typeof limitOrScope === "string" ? limitOrScope : scope ?? null;
    }
    const dateFilter = buildCreatedAtFilter(creatorViews.createdAt, range);
    const where = topCreatorsByViewsWhere(creatorScope, dateFilter);
    const viewQueryBase = db.select({
      creatorId: creators.id,
      viewCount: count(creatorViews.id)
    }).from(creatorViews).innerJoin(creators, eq(creatorViews.creatorId, creators.id)).where(where).groupBy(creators.id).orderBy(desc(count(creatorViews.id)), asc(creators.displayName));
    if (paginate) {
      const countQuery = db.select({
        value: sql`count(distinct ${creators.id})`
      }).from(creatorViews).innerJoin(creators, eq(creatorViews.creatorId, creators.id)).where(where);
      const [{ value: totalCount = 0 }] = await countQuery;
      const { page, limit: pageLimit, offset, totalPages } = getPagination(
        currentPage,
        totalCount,
        limit
      );
      if (totalCount === 0) {
        return ok({ creators: [], totalPages: 1, page: 1 });
      }
      const viewRows2 = await viewQueryBase.limit(pageLimit).offset(offset);
      if (viewRows2.length === 0) {
        return ok({ creators: [], totalPages, page });
      }
      const creatorIds2 = viewRows2.map((row) => row.creatorId);
      const viewCountByCreatorId = new Map(
        viewRows2.map((row) => [row.creatorId, row.viewCount])
      );
      const creatorRows2 = await db.query.creators.findMany({
        where: inArray(creators.id, creatorIds2),
        columns: {
          id: true,
          displayName: true,
          slug: true,
          coverUrl: true,
          type: true
        }
      });
      const creatorById2 = new Map(
        creatorRows2.map((creator) => [creator.id, creator])
      );
      const topCreators = creatorIds2.map((creatorId) => {
        const creator = creatorById2.get(creatorId);
        if (!creator) return null;
        return {
          creatorId: creator.id,
          displayName: creator.displayName,
          slug: creator.slug,
          coverUrl: creator.coverUrl,
          type: creator.type,
          viewCount: viewCountByCreatorId.get(creator.id) ?? 0
        };
      }).filter((row) => row !== null);
      return ok({ creators: topCreators, totalPages, page });
    }
    const viewRows = await viewQueryBase.limit(limit);
    if (viewRows.length === 0) return ok([]);
    const creatorIds = viewRows.map((row) => row.creatorId);
    const creatorRows = await db.query.creators.findMany({
      where: inArray(creators.id, creatorIds),
      columns: CREATOR_CARD_COLUMNS
    });
    const creatorById = new Map(
      creatorRows.map((creator) => [creator.id, creator])
    );
    const rows = viewRows.map((viewRow) => creatorById.get(viewRow.creatorId)).filter((creator) => creator !== void 0);
    return ok(rows);
  } catch (error) {
    console.error("Failed to get top creators by profile views", error);
    return err({
      reason: "Failed to get top creators by profile views",
      cause: error
    });
  }
}
export {
  getCreatorProfileViewTotal,
  getCreatorViewTotals,
  getTopCreatorsByViews,
  recordCreatorView
};
