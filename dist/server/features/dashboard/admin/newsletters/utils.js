export * from "../../../../domain/newsletters/newsletterUtils.js";
import { parseDateString } from "../../../../lib/utils.js";
const formatNewsletterDate = (dateStr) => {
  const date = parseDateString(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  });
};
export {
  formatNewsletterDate
};
