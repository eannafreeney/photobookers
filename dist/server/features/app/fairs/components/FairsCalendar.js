import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "../../../../components/app/Link.js";
import { fairUrl } from "../../spotlightUrls.js";
const FairsCalendar = ({ year, month, fairs, baseUrl }) => {
  const monthName = new Date(year, month - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const fairsByDate = /* @__PURE__ */ new Map();
  fairs.forEach((fair) => {
    const start = new Date(fair.startDate);
    const end = new Date(fair.endDate);
    for (let d = 1; d <= daysInMonth; d++) {
      const currentDate = new Date(year, month - 1, d);
      if (currentDate >= start && currentDate <= end) {
        const existing = fairsByDate.get(d) || [];
        fairsByDate.set(d, [...existing, fair]);
      }
    }
  });
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h2", { class: "text-2xl font-display font-medium text-on-surface-strong", children: monthName }),
      /* @__PURE__ */ jsxs("div", { class: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            href: `${baseUrl}?view=calendar&year=${prevYear}&month=${prevMonth}`,
            className: "px-4 py-2 text-sm rounded border border-outline hover:border-accent transition-colors",
            children: "\u2190 Previous"
          }
        ),
        /* @__PURE__ */ jsx(
          Link,
          {
            href: `${baseUrl}?view=calendar&year=${nextYear}&month=${nextMonth}`,
            className: "px-4 py-2 text-sm rounded border border-outline hover:border-accent transition-colors",
            children: "Next \u2192"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "border-2 border-on-surface-strong rounded", children: [
      /* @__PURE__ */ jsx("div", { class: "grid grid-cols-7 border-b-2 border-on-surface-strong", children: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => /* @__PURE__ */ jsx(
        "div",
        {
          class: "p-2 text-center text-sm font-medium text-on-surface-strong bg-surface-container",
          children: day
        },
        day
      )) }),
      /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-7", children: [
        Array.from({ length: firstDayOfMonth }).map((_, i) => /* @__PURE__ */ jsx(
          "div",
          {
            class: "min-h-[120px] p-2 border-b border-r border-outline bg-surface-container-low"
          },
          `empty-${i}`
        )),
        Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayFairs = fairsByDate.get(day) || [];
          const isToday = (/* @__PURE__ */ new Date()).toDateString() === new Date(year, month - 1, day).toDateString();
          return /* @__PURE__ */ jsxs(
            "div",
            {
              class: `min-h-[120px] p-2 border-b border-r border-outline ${isToday ? "bg-accent/5" : ""}`,
              children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    class: `text-sm font-medium mb-2 ${isToday ? "inline-flex items-center justify-center size-6 rounded-full bg-accent text-on-accent" : "text-on-surface"}`,
                    children: day
                  }
                ),
                /* @__PURE__ */ jsx("div", { class: "flex flex-col gap-1", children: dayFairs.map((fair) => /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: fairUrl(fair.slug),
                    className: `text-xs p-1 rounded hover:bg-surface-container transition-colors line-clamp-2 ${fair.listingTier === "promoted" ? "bg-accent/10 text-accent font-medium" : "text-on-surface-muted"}`,
                    children: fair.name
                  },
                  fair.id
                )) })
              ]
            },
            day
          );
        })
      ] })
    ] }),
    fairs.length === 0 && /* @__PURE__ */ jsx("div", { class: "text-center py-8 text-on-surface-muted", children: "No fairs scheduled for this month" })
  ] });
};
var FairsCalendar_default = FairsCalendar;
export {
  FairsCalendar_default as default
};
