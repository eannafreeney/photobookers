import {
  getArtistOfTheWeekForDateQuery,
  getPublisherOfTheWeekForDateQuery,
} from "../dashboard/admin/planner/services";

export async function getThisWeeksArtistOfTheWeek() {
  return getArtistOfTheWeekForDateQuery(new Date());
}
export async function getThisWeeksPublisherOfTheWeek() {
  return getPublisherOfTheWeekForDateQuery(new Date());
}
