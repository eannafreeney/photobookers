import {
  presetAnalyticsDateRange,
  type AnalyticsDateRange,
} from "../book-analytics/dateRange";
import { toDateString } from "../../lib/utils";

export type Ga4DateRange = {
  startDate: string;
  endDate: string;
  usesDefaultRange: boolean;
};

export function resolveGa4DateRange(
  dateRange: AnalyticsDateRange | null,
): Ga4DateRange {
  const effective = dateRange ?? presetAnalyticsDateRange(90);
  return {
    startDate: toDateString(effective.from),
    endDate: toDateString(effective.to),
    usesDefaultRange: dateRange === null,
  };
}
