import {
  presetAnalyticsDateRange
} from "../book-analytics/dateRange.js";
import { toDateString } from "../../lib/utils.js";
function resolveGa4DateRange(dateRange) {
  const effective = dateRange ?? presetAnalyticsDateRange(90);
  return {
    startDate: toDateString(effective.from),
    endDate: toDateString(effective.to),
    usesDefaultRange: dateRange === null
  };
}
export {
  resolveGa4DateRange
};
