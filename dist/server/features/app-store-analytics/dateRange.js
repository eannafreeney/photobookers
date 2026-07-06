import {
  presetAnalyticsDateRange
} from "../book-analytics/dateRange.js";
import { toDateString } from "../../lib/utils.js";
function resolveAscDateRange(dateRange) {
  const effective = dateRange ?? presetAnalyticsDateRange(30);
  return {
    startDate: toDateString(effective.from),
    endDate: toDateString(effective.to),
    usesDefaultRange: dateRange === null
  };
}
export {
  resolveAscDateRange
};
