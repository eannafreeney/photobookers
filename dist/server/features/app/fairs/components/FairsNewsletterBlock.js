import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "../../../../components/app/Link.js";
import { fairUrl } from "../../spotlightUrls.js";
const FairsNewsletterBlock = ({
  fairs,
  title = "Upcoming Photobook Fairs",
  limit = 5
}) => {
  const displayFairs = fairs.slice(0, limit);
  if (displayFairs.length === 0) {
    return null;
  }
  const formatDateRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (startDate.toDateString() === endDate.toDateString()) {
      return startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
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
    return `${startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    })} \u2013 ${endDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })}`;
  };
  return /* @__PURE__ */ jsxs("div", { class: "border-2 border-on-surface-strong rounded p-6 bg-surface-container-low", children: [
    /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsx("h3", { class: "text-xl font-display font-medium text-on-surface-strong", children: title }),
      /* @__PURE__ */ jsx(
        Link,
        {
          href: "/fairs",
          className: "text-sm text-accent hover:underline underline-offset-4",
          children: "View all \u2192"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { class: "flex flex-col gap-4", children: displayFairs.map((fair) => {
      const location = fair.city && fair.country ? `${fair.city}, ${fair.country}` : fair.city || fair.country || null;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          class: "flex gap-4 pb-4 border-b border-outline last:border-0 last:pb-0",
          children: [
            fair.coverUrl && /* @__PURE__ */ jsx(
              Link,
              {
                href: fairUrl(fair.slug),
                className: "flex-shrink-0 block",
                children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: fair.coverUrl,
                    alt: fair.name,
                    class: "w-20 h-20 object-cover rounded border border-outline"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxs("div", { class: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx(
                Link,
                {
                  href: fairUrl(fair.slug),
                  className: "font-medium text-on-surface-strong hover:text-accent transition-colors line-clamp-2",
                  children: fair.name
                }
              ),
              /* @__PURE__ */ jsx("div", { class: "mt-1 text-sm text-on-surface-muted", children: formatDateRange(fair.startDate, fair.endDate) }),
              location && /* @__PURE__ */ jsx("div", { class: "mt-0.5 text-sm text-on-surface-muted", children: location }),
              fair.website && /* @__PURE__ */ jsx(
                "a",
                {
                  href: fair.website,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  class: "mt-1 inline-block text-xs text-accent hover:underline underline-offset-4",
                  children: "Fair website \u2192"
                }
              )
            ] })
          ]
        },
        fair.id
      );
    }) })
  ] });
};
var FairsNewsletterBlock_default = FairsNewsletterBlock;
export {
  FairsNewsletterBlock_default as default
};
