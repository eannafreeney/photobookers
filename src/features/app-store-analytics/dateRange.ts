import {
  presetAnalyticsDateRange,
  type AnalyticsDateRange,
} from "../book-analytics/dateRange";
import { toDateString } from "../../lib/utils";

export type AscDateRange = {
  startDate: string;
  endDate: string;
  usesDefaultRange: boolean;
};

export function resolveAscDateRange(
  dateRange: AnalyticsDateRange | null,
): AscDateRange {
  const effective = dateRange ?? presetAnalyticsDateRange(30);
  return {
    startDate: toDateString(effective.from),
    endDate: toDateString(effective.to),
    usesDefaultRange: dateRange === null,
  };
}
