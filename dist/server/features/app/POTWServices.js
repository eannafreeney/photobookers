import { db } from "../../db/client.js";
import { publisherOfTheWeek } from "../../db/schema.js";
import { count, desc, eq, lte } from "drizzle-orm";
import { err, ok } from "../../lib/result.js";
import { getPagination } from "../../lib/pagination.js";
function toWeekStart(d) {
  const date = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
  const day = date.getUTCDay();
  const daysToMonday = day === 0 ? 6 : day - 1;
  date.setUTCDate(date.getUTCDate() - daysToMonday);
  return date;
}
async function getPublisherOfTheWeekForDateQuery(date) {
  const weekStart = toWeekStart(date);
  try {
    const publisher = await db.query.publisherOfTheWeek.findFirst({
      where: eq(publisherOfTheWeek.weekStart, weekStart),
      with: {
        creator: true
      }
    });
    if (!publisher) return err({ reason: "Publisher of the week not found" });
    return ok(publisher);
  } catch (error) {
    console.error("getPublisherOfTheWeekForDateQuery", error);
    return err({ reason: "Failed to get publisher of the week for date" });
  }
}
async function getThisWeeksPublisherOfTheWeek() {
  return getPublisherOfTheWeekForDateQuery(/* @__PURE__ */ new Date());
}
async function getRecentPublishersOfTheWeek(currentPage = 1, defaultLimit = 12) {
  const todayWeekStart = toWeekStart(/* @__PURE__ */ new Date());
  try {
    const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(publisherOfTheWeek).where(lte(publisherOfTheWeek.weekStart, todayWeekStart));
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit
    );
    const rows = await db.query.publisherOfTheWeek.findMany({
      where: lte(publisherOfTheWeek.weekStart, todayWeekStart),
      orderBy: [desc(publisherOfTheWeek.weekStart)],
      limit,
      offset,
      with: {
        creator: true
      }
    });
    return ok({ potwEntries: rows, totalPages, page });
  } catch (error) {
    console.error("getRecentPublishersOfTheWeek", error);
    return err({
      reason: "Failed to get recent publishers of the week",
      cause: error
    });
  }
}
export {
  getPublisherOfTheWeekForDateQuery,
  getRecentPublishersOfTheWeek,
  getThisWeeksPublisherOfTheWeek
};
