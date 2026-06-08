import { CREATOR_CARD_COLUMNS } from "../../constants/queries";
import { db } from "../../db/client";
import { publisherOfTheWeek } from "../../db/schema";
import { count, desc, eq, lte } from "drizzle-orm";
import { err, ok } from "../../lib/result";
import { getPagination } from "../../lib/pagination";

/** Normalize to start of day UTC for consistent storage/comparison */
function toWeekStart(d: Date): Date {
  const date = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  const day = date.getUTCDay();
  const daysToMonday = day === 0 ? 6 : day - 1;
  date.setUTCDate(date.getUTCDate() - daysToMonday);
  return date;
}

type GetPublisherOfTheWeekForDateResult = Awaited<
  ReturnType<typeof getPublisherOfTheWeekForDateQuery>
>;

export type PublisherOfTheWeekWithCreator = Extract<
  GetPublisherOfTheWeekForDateResult,
  [null, unknown]
>[1];

export async function getPublisherOfTheWeekForDateQuery(date: Date) {
  const weekStart = toWeekStart(date);
  try {
    const publisher = await db.query.publisherOfTheWeek.findFirst({
      where: eq(publisherOfTheWeek.weekStart, weekStart),
      with: {
        creator: true,
      },
    });

    if (!publisher) return err({ reason: "Publisher of the week not found" });
    return ok(publisher);
  } catch (error) {
    console.error("getPublisherOfTheWeekForDateQuery", error);
    return err({ reason: "Failed to get publisher of the week for date" });
  }
}

export async function getThisWeeksPublisherOfTheWeek() {
  return getPublisherOfTheWeekForDateQuery(new Date());
}

export async function getRecentPublishersOfTheWeek(
  currentPage: number = 1,
  defaultLimit: number = 12,
) {
  const todayWeekStart = toWeekStart(new Date());

  try {
    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(publisherOfTheWeek)
      .where(lte(publisherOfTheWeek.weekStart, todayWeekStart));

    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit,
    );

    const rows = await db.query.publisherOfTheWeek.findMany({
      where: lte(publisherOfTheWeek.weekStart, todayWeekStart),
      orderBy: [desc(publisherOfTheWeek.weekStart)],
      limit,
      offset,
      with: {
        creator: true,
      },
    });

    return ok({ potwEntries: rows, totalPages, page });
  } catch (error) {
    console.error("getRecentPublishersOfTheWeek", error);
    return err({
      reason: "Failed to get recent publishers of the week",
      cause: error,
    });
  }
}
