import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { fairUrl } from "../../spotlightUrls.js";
import Link from "../../../../components/app/Link.js";
const UpcomingFairsSection = ({
  fairs,
  emptyMessage = "No upcoming fairs"
}) => {
  if (fairs.length === 0) {
    return /* @__PURE__ */ jsx("div", { class: "text-sm text-on-surface-muted italic", children: emptyMessage });
  }
  return /* @__PURE__ */ jsx("div", { class: "flex flex-col gap-3", children: fairs.map((fair) => /* @__PURE__ */ jsx(FairItem, { fair }, fair.id)) });
};
var UpcomingFairsSection_default = UpcomingFairsSection;
const FairItem = ({ fair }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };
  const formatDateRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (startDate.toDateString() === endDate.toDateString()) {
      return formatDate(startDate);
    }
    if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
      return `${startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      })}\u2013${endDate.toLocaleDateString("en-US", {
        day: "numeric",
        year: "numeric"
      })}`;
    }
    return `${formatDate(startDate)} \u2013 ${formatDate(endDate)}`;
  };
  const location = fair.city && fair.country ? `${fair.city}, ${fair.country}` : fair.city || fair.country || null;
  return /* @__PURE__ */ jsx(
    Link,
    {
      href: fairUrl(fair.slug),
      className: "block group hover:bg-surface-container-low transition-colors p-2 -mx-2 rounded",
      children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-0.5", children: [
        /* @__PURE__ */ jsx("div", { class: "text-sm font-medium text-on-surface-strong group-hover:text-accent transition-colors", children: fair.name }),
        /* @__PURE__ */ jsx("div", { class: "text-xs text-on-surface-muted", children: formatDateRange(fair.startDate, fair.endDate) }),
        location && /* @__PURE__ */ jsx("div", { class: "text-xs text-on-surface-muted", children: location })
      ] })
    }
  );
};
export {
  UpcomingFairsSection_default as default
};
