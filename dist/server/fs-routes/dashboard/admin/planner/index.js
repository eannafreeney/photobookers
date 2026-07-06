import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils.js";
import {
  getWeekNumber,
  getWeekStarts,
  isWeekInPast
} from "../../../../features/dashboard/admin/planner/utils.js";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import Page from "../../../../components/layouts/Page.js";
import { toWeekString } from "../../../../lib/utils.js";
import WeekCard from "../../../../features/dashboard/admin/planner/components/WeekCard.js";
import InfoPage from "../../../../pages/InfoPage.js";
import { loadPlannerYearData } from "../../../../features/dashboard/admin/planner/queries.js";
import Sidebar from "../../../../components/app/Sidebar.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const year = Number(c.req.query("year") ?? (/* @__PURE__ */ new Date()).getFullYear());
  const weekStarts = getWeekStarts(year);
  const currentPath = c.req.path;
  const {
    botdByDate,
    artistByWeekStart,
    artistLoadError,
    publisherByWeekStart,
    publisherLoadError,
    newsletterStatusByWeekStart,
    instagramPreparedByWeekStart,
    interviewByCreatorId
  } = await loadPlannerYearData(year);
  if (artistLoadError || publisherLoadError) {
    return c.html(
      /* @__PURE__ */ jsx(InfoPage, { errorMessage: "Failed to load planner year data", user })
    );
  }
  const alpineAttrs = {
    "x-init": true,
    "x-on:planner:updated.window": "$ajax('/dashboard/admin/planner', { target: 'planner-grid' })"
  };
  return c.html(
    /* @__PURE__ */ jsx(AppLayout, { title: "BOTD Planner", user, currentPath, children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs(Sidebar, { currentPath, children: [
      /* @__PURE__ */ jsx(PlannerHeader, { year }),
      /* @__PURE__ */ jsx(
        "div",
        {
          id: "planner-grid",
          class: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
          ...alpineAttrs,
          children: weekStarts.filter((weekStart) => !isWeekInPast(weekStart)).map((weekStart) => {
            const key = toWeekString(weekStart);
            const artistOfTheWeek = artistByWeekStart?.get(key) ?? null;
            const publisherOfTheWeek = publisherByWeekStart?.get(key) ?? null;
            const newsletterStatus = newsletterStatusByWeekStart.get(key) ?? null;
            const instagramPrepared = instagramPreparedByWeekStart.get(key) ?? false;
            return /* @__PURE__ */ jsx(
              WeekCard,
              {
                weekStart,
                weekNumber: getWeekNumber(weekStart),
                botdByDate,
                artistOfTheWeek,
                publisherOfTheWeek,
                newsletterStatus,
                instagramPrepared,
                interviewByCreatorId
              },
              key
            );
          })
        }
      )
    ] }) }) })
  );
});
const PlannerHeader = ({ year }) => {
  return /* @__PURE__ */ jsxs("div", { class: "mb-6 flex flex-wrap items-center justify-between gap-4", children: [
    /* @__PURE__ */ jsxs("h1", { class: "text-xl font-semibold text-on-surface-strong", children: [
      "Book of the Day \u2013 ",
      year
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: `/dashboard/admin/planner?year=${year - 1}`,
          class: "rounded border border-outline bg-surface-alt px-3 py-1.5 text-sm font-medium text-on-surface hover:bg-surface",
          children: [
            "\u2190 ",
            year - 1
          ]
        }
      ),
      /* @__PURE__ */ jsx("span", { class: "text-sm text-on-surface", children: year }),
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: `/dashboard/admin/planner?year=${year + 1}`,
          class: "rounded border border-outline bg-surface-alt px-3 py-1.5 text-sm font-medium text-on-surface hover:bg-surface",
          children: [
            year + 1,
            " \u2192"
          ]
        }
      )
    ] })
  ] });
};
export {
  GET
};
