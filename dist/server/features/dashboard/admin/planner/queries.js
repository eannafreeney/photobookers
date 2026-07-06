import {
  getArtistsOfTheWeekByWeekStart,
  getBotdByDate,
  getPublishersOfTheWeekByWeekStart
} from "./services.js";
import { db } from "../../../../db/client.js";
import {
  creatorInterviews,
  newsletterCampaigns
} from "../../../../db/schema.js";
import { and, desc, gte, inArray, lte } from "drizzle-orm";
import { getWeekStarts } from "./utils.js";
import { toDateString, toWeekString } from "../../../../lib/utils.js";
import { getInstagramPreparedByWeekStart } from "./instagramServices.js";
import { getNewsletterRangeStartForPlannerWeek } from "./newsletterUtils.js";
const loadPlannerYearData = async (year) => {
  const [
    botdByDate,
    artistResult,
    publisherResult,
    newsletterStatusByWeekStart,
    instagramPreparedByWeekStart
  ] = await Promise.all([
    getBotdByDate(year),
    getArtistsOfTheWeekByWeekStart(year),
    getPublishersOfTheWeekByWeekStart(year),
    getNewsletterStatusesByWeekStart(year),
    getInstagramPreparedByWeekStart(year)
  ]);
  const [artistErr, artistMap] = artistResult;
  const [publisherErr, publisherMap] = publisherResult;
  const interviewByCreatorId = await getInterviewsByCreatorIdForPlanner(
    artistErr ? void 0 : artistMap ?? void 0,
    publisherErr ? void 0 : publisherMap ?? void 0
  );
  return {
    botdByDate,
    artistByWeekStart: artistErr ? null : artistMap,
    artistLoadError: artistErr?.reason ?? null,
    publisherByWeekStart: publisherErr ? null : publisherMap,
    publisherLoadError: publisherErr?.reason ?? null,
    newsletterStatusByWeekStart,
    instagramPreparedByWeekStart,
    interviewByCreatorId
  };
};
async function getInterviewsByCreatorIdForPlanner(artistMap, publisherMap) {
  const creatorIds = /* @__PURE__ */ new Set();
  for (const entry of artistMap?.values() ?? []) {
    if (entry?.creatorId) creatorIds.add(entry.creatorId);
  }
  for (const entry of publisherMap?.values() ?? []) {
    if (entry?.creatorId) creatorIds.add(entry.creatorId);
  }
  if (creatorIds.size === 0) return /* @__PURE__ */ new Map();
  const rows = await db.query.creatorInterviews.findMany({
    where: inArray(creatorInterviews.creatorId, [...creatorIds]),
    orderBy: [desc(creatorInterviews.invitedAt)]
  });
  const byCreatorId = /* @__PURE__ */ new Map();
  for (const row of rows) {
    if (!byCreatorId.has(row.creatorId)) {
      byCreatorId.set(row.creatorId, row);
    }
  }
  return byCreatorId;
}
const getNewsletterStatusesByWeekStart = async (year) => {
  const weekStarts = getWeekStarts(year);
  if (weekStarts.length === 0) return /* @__PURE__ */ new Map();
  const first = weekStarts[0];
  const last = weekStarts[weekStarts.length - 1];
  const lastSunday = new Date(last);
  lastSunday.setUTCDate(lastSunday.getUTCDate() + 6);
  const rows = await db.query.newsletterCampaigns.findMany({
    where: and(
      gte(newsletterCampaigns.weekStart, first),
      lte(newsletterCampaigns.weekStart, lastSunday)
    )
  });
  const byWeek = /* @__PURE__ */ new Map();
  for (const weekStart of weekStarts) {
    const weekKey = toWeekString(weekStart);
    const newsletterRangeStart = getNewsletterRangeStartForPlannerWeek(weekStart);
    const row = rows.find(
      (entry) => toDateString(entry.weekStart) === toDateString(newsletterRangeStart)
    );
    byWeek.set(weekKey, row?.status ?? null);
  }
  return byWeek;
};
export {
  loadPlannerYearData
};
