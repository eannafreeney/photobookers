import { CREATOR_CARD_COLUMNS } from "../../constants/queries";
import { db } from "../../db/client";
import { artistOfTheWeek } from "../../db/schema";
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

type GetArtistOfTheWeekForDateResult = Awaited<
  ReturnType<typeof getArtistOfTheWeekForDateQuery>
>;

export type ArtistOfTheWeekWithCreator = Extract<
  GetArtistOfTheWeekForDateResult,
  [null, unknown]
>[1];

export async function getArtistOfTheWeekForDateQuery(date: Date) {
  const weekStart = toWeekStart(date);
  try {
    const artist = await db.query.artistOfTheWeek.findFirst({
      where: eq(artistOfTheWeek.weekStart, weekStart),
      with: {
        creator: true,
      },
    });

    if (!artist) return err({ reason: "Artist of the week not found" });
    return ok(artist);
  } catch (error) {
    console.error("getArtistOfTheWeekForDateQuery", error);
    return err({ reason: "Failed to get artist of the week for date" });
  }
}

export async function getThisWeeksArtistOfTheWeek() {
  return getArtistOfTheWeekForDateQuery(new Date());
}

export async function getRecentArtistsOfTheWeek(
  currentPage: number = 1,
  defaultLimit: number = 12,
) {
  const todayWeekStart = toWeekStart(new Date());

  try {
    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(artistOfTheWeek)
      .where(lte(artistOfTheWeek.weekStart, todayWeekStart));

    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit,
    );

    const rows = await db.query.artistOfTheWeek.findMany({
      where: lte(artistOfTheWeek.weekStart, todayWeekStart),
      orderBy: [desc(artistOfTheWeek.weekStart)],
      limit,
      offset,
      with: {
        creator: true,
      },
    });

    return ok({ aotwEntries: rows, totalPages, page });
  } catch (error) {
    console.error("getRecentArtistsOfTheWeek", error);
    return err({
      reason: "Failed to get recent artists of the week",
      cause: error,
    });
  }
}
