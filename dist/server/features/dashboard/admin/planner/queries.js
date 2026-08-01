import {
  getArtistsOfTheWeekByWeekStart,
  getBotdByDate,
  getPublishersOfTheWeekByWeekStart
} from "./services.js";
import { db } from "../../../../db/client.js";
import { creatorInterviews } from "../../../../db/schema.js";
import { desc, inArray } from "drizzle-orm";
import { getInstagramPreparedByWeekStart } from "./social-media/instagramServices.js";
const loadPlannerYearData = async (year) => {
  const [botdByDate, artistResult, publisherResult, instagramPreparedByWeekStart] = await Promise.all([
    getBotdByDate(year),
    getArtistsOfTheWeekByWeekStart(year),
    getPublishersOfTheWeekByWeekStart(year),
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
export {
  loadPlannerYearData
};
