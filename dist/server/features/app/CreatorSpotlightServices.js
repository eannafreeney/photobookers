import {
  getArtistOfTheWeekForDateQuery,
  getPublisherOfTheWeekForDateQuery
} from "../dashboard/admin/planner/services.js";
async function getThisWeeksArtistOfTheWeek() {
  return getArtistOfTheWeekForDateQuery(/* @__PURE__ */ new Date());
}
async function getThisWeeksPublisherOfTheWeek() {
  return getPublisherOfTheWeekForDateQuery(/* @__PURE__ */ new Date());
}
export {
  getThisWeeksArtistOfTheWeek,
  getThisWeeksPublisherOfTheWeek
};
