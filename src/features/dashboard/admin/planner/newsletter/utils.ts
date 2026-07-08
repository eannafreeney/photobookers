export * from "../../../../../domain/planner/newsletterUtils";

import { parseDateString } from "@/lib/utils";

export const formatNewsletterDate = (dateStr: string) => {
  const date = parseDateString(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
};
