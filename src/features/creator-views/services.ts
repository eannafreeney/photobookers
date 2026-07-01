import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "../../db/client";
import {
  creatorViews,
  creators,
  type CreatorType,
  type CreatorViewSource,
} from "../../db/schema";
import {
  buildCreatedAtFilter,
  type AnalyticsDateRange,
} from "../book-analytics/dateRange";
import { err, ok, type Result } from "../../lib/result";
import {
  CREATOR_CARD_COLUMNS,
  type CreatorCardResult,
} from "../../constants/queries";
import { getPagination } from "../../lib/pagination";

const MAX_REFERER_LENGTH = 512;

export type RecordCreatorViewInput = {
  creatorId: string;
  userId?: string | null;
  source?: CreatorViewSource;
  referer?: string | null;
};

export const recordCreatorView = async ({
  creatorId,
  userId,
  source = "web",
  referer,
}: RecordCreatorViewInput) => {
  try {
    const trimmedReferer = referer?.trim().slice(0, MAX_REFERER_LENGTH) ?? null;
    await db.insert(creatorViews).values({
      creatorId,
      userId: userId ?? null,
      source,
      referer: trimmedReferer,
    });
    return ok(undefined);
  } catch (error) {
    console.error("Failed to record creator view", error);
    return err({ reason: "Failed to record creator view", cause: error });
  }
};

function countViewsForCreatorType(
  type: "publisher" | "artist",
  dateFilter: ReturnType<typeof buildCreatedAtFilter>,
) {
  const typeFilter = eq(creators.type, type);
  const where = dateFilter ? and(typeFilter, dateFilter) : typeFilter;

  return db
    .select({ value: count() })
    .from(creatorViews)
    .innerJoin(creators, eq(creatorViews.creatorId, creators.id))
    .where(where);
}

export const getCreatorProfileViewTotal = async (creatorId: string) => {
  const result = await db
    .select({ value: count() })
    .from(creatorViews)
    .where(eq(creatorViews.creatorId, creatorId));

  return result[0]?.value ?? 0;
};

export const getCreatorViewTotals = async (
  range?: AnalyticsDateRange | null,
) => {
  const dateFilter = buildCreatedAtFilter(creatorViews.createdAt, range);
  const [publisherViewsResult, artistViewsResult] = await Promise.all([
    countViewsForCreatorType("publisher", dateFilter),
    countViewsForCreatorType("artist", dateFilter),
  ]);

  return {
    publisherPageViews: publisherViewsResult[0]?.value ?? 0,
    artistPageViews: artistViewsResult[0]?.value ?? 0,
  };
};

export type TopCreatorByViewsRow = {
  creatorId: string;
  displayName: string;
  slug: string;
  coverUrl: string | null;
  type: CreatorType;
  viewCount: number;
};

export type TopCreatorsByViewsScope = Extract<CreatorType, "publisher" | "artist">;

function topCreatorsByViewsWhere(
  creatorScope: TopCreatorsByViewsScope | null,
  dateFilter: ReturnType<typeof buildCreatedAtFilter>,
) {
  const typeFilter = creatorScope ? eq(creators.type, creatorScope) : undefined;
  if (typeFilter && dateFilter) return and(typeFilter, dateFilter);
  return typeFilter ?? dateFilter;
}

export function getTopCreatorsByViews(
  limit: number,
): Promise<Result<CreatorCardResult[], { reason: string }>>;

export function getTopCreatorsByViews(
  range: AnalyticsDateRange | null | undefined,
  currentPage: number,
  limitOrScope?: number | TopCreatorsByViewsScope | null,
  scope?: TopCreatorsByViewsScope | null,
): Promise<
  Result<
    {
      creators: TopCreatorByViewsRow[];
      totalPages: number;
      page: number;
    },
    { reason: string }
  >
>;

export async function getTopCreatorsByViews(
  rangeOrLimit?: AnalyticsDateRange | null | number,
  currentPage?: number,
  limitOrScope: number | TopCreatorsByViewsScope | null = 10,
  scope?: TopCreatorsByViewsScope | null,
): Promise<
  Result<
    | CreatorCardResult[]
    | {
        creators: TopCreatorByViewsRow[];
        totalPages: number;
        page: number;
      },
    { reason: string }
  >
> {
  try {
    const paginate = currentPage !== undefined;

    let limit: number;
    let creatorScope: TopCreatorsByViewsScope | null;
    let range: AnalyticsDateRange | null | undefined;

    if (paginate) {
      range = typeof rangeOrLimit === "number" ? null : rangeOrLimit;
      limit = typeof limitOrScope === "number" ? limitOrScope : 10;
      creatorScope =
        typeof limitOrScope === "string" ? limitOrScope : (scope ?? null);
    } else if (typeof rangeOrLimit === "number") {
      // Single-arg overload: getTopCreatorsByViews(limit)
      range = null;
      limit = rangeOrLimit;
      creatorScope = null;
    } else {
      range = rangeOrLimit;
      limit = typeof limitOrScope === "number" ? limitOrScope : 10;
      creatorScope =
        typeof limitOrScope === "string" ? limitOrScope : (scope ?? null);
    }

    const dateFilter = buildCreatedAtFilter(creatorViews.createdAt, range);
    const where = topCreatorsByViewsWhere(creatorScope, dateFilter);

    const viewQueryBase = db
      .select({
        creatorId: creators.id,
        viewCount: count(creatorViews.id),
      })
      .from(creatorViews)
      .innerJoin(creators, eq(creatorViews.creatorId, creators.id))
      .where(where)
      .groupBy(creators.id)
      .orderBy(desc(count(creatorViews.id)), asc(creators.displayName));

    if (paginate) {
      const countQuery = db
        .select({
          value: sql<number>`count(distinct ${creators.id})`,
        })
        .from(creatorViews)
        .innerJoin(creators, eq(creatorViews.creatorId, creators.id))
        .where(where);

      const [{ value: totalCount = 0 }] = await countQuery;
      const { page, limit: pageLimit, offset, totalPages } = getPagination(
        currentPage,
        totalCount,
        limit,
      );

      if (totalCount === 0) {
        return ok({ creators: [], totalPages: 1, page: 1 });
      }

      const viewRows = await viewQueryBase.limit(pageLimit).offset(offset);

      if (viewRows.length === 0) {
        return ok({ creators: [], totalPages, page });
      }

      const creatorIds = viewRows.map((row) => row.creatorId);
      const viewCountByCreatorId = new Map(
        viewRows.map((row) => [row.creatorId, row.viewCount]),
      );

      const creatorRows = await db.query.creators.findMany({
        where: inArray(creators.id, creatorIds),
        columns: {
          id: true,
          displayName: true,
          slug: true,
          coverUrl: true,
          type: true,
        },
      });

      const creatorById = new Map(
        creatorRows.map((creator) => [creator.id, creator]),
      );

      const topCreators = creatorIds
        .map((creatorId) => {
          const creator = creatorById.get(creatorId);
          if (!creator) return null;
          return {
            creatorId: creator.id,
            displayName: creator.displayName,
            slug: creator.slug,
            coverUrl: creator.coverUrl,
            type: creator.type,
            viewCount: viewCountByCreatorId.get(creator.id) ?? 0,
          };
        })
        .filter((row): row is TopCreatorByViewsRow => row !== null);

      return ok({ creators: topCreators, totalPages, page });
    }

    const viewRows = await viewQueryBase.limit(limit);

    if (viewRows.length === 0) return ok([]);

    const creatorIds = viewRows.map((row) => row.creatorId);
    const creatorRows = await db.query.creators.findMany({
      where: inArray(creators.id, creatorIds),
      columns: CREATOR_CARD_COLUMNS,
    });

    const creatorById = new Map(
      creatorRows.map((creator) => [creator.id, creator]),
    );

    const rows = viewRows
      .map((viewRow) => creatorById.get(viewRow.creatorId))
      .filter((creator): creator is CreatorCardResult => creator !== undefined);

    return ok(rows);
  } catch (error) {
    console.error("Failed to get top creators by profile views", error);
    return err({
      reason: "Failed to get top creators by profile views",
      cause: error,
    });
  }
}
