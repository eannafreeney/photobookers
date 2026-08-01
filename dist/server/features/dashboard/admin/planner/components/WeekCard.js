import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Card from "../../../../../components/app/Card.js";
import { toDateString, toWeekString } from "../../../../../lib/utils.js";
import BOTDCard from "./BOTDCard.js";
import AOTWCard from "./AOTWCard.js";
import POTWCard from "./POTWCard.js";
import { formatWeekRange, getWeekDays } from "../utils.js";
import RandomizeBOTDButton from "./RandomizeBOTDButton.js";
import Button from "../../../../../components/app/Button.js";
const WeekCard = ({
  weekStart,
  weekNumber,
  botdByDate,
  artistOfTheWeek,
  publisherOfTheWeek,
  instagramPrepared,
  interviewByCreatorId
}) => {
  const days = getWeekDays(weekStart);
  return /* @__PURE__ */ jsxs(Card, { className: "flex flex-col", children: [
    /* @__PURE__ */ jsx(
      WeekCardHeader,
      {
        weekStart,
        weekNumber,
        instagramPrepared,
        botdByDate
      }
    ),
    /* @__PURE__ */ jsxs(Card.Body, { gap: "2", children: [
      days.map((day) => {
        const key = toDateString(day);
        const botd = botdByDate.get(key) ?? null;
        return /* @__PURE__ */ jsx(BOTDCard, { date: day, bookOfTheDay: botd }, key);
      }),
      /* @__PURE__ */ jsx(
        AOTWCard,
        {
          weekStart,
          artistOfTheWeek,
          interview: artistOfTheWeek ? interviewByCreatorId?.get(artistOfTheWeek.creatorId) ?? null : null
        }
      ),
      /* @__PURE__ */ jsx(
        POTWCard,
        {
          weekStart,
          publisherOfTheWeek,
          interview: publisherOfTheWeek ? interviewByCreatorId?.get(publisherOfTheWeek.creatorId) ?? null : null
        }
      )
    ] })
  ] });
};
var WeekCard_default = WeekCard;
const instagramButtonClasses = (prepared) => {
  const base = "rounded border px-2 py-1 text-xs font-medium opacity-80";
  if (prepared) {
    return `${base} border-success bg-success/15 text-on-surface-strong hover:opacity-90`;
  }
  return `${base} border-outline bg-surface-alt text-on-surface hover:bg-surface`;
};
const WeekCardHeader = ({
  weekStart,
  weekNumber,
  instagramPrepared,
  botdByDate
}) => {
  const weekKey = toWeekString(weekStart);
  const instagramLabel = instagramPrepared ? "Edit Instagram" : "Prepare Instagram";
  return /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-between gap-2 p-3 border-b border-outline", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("span", { class: "text-xs font-medium text-on-surface", children: [
        "Week ",
        weekNumber
      ] }),
      /* @__PURE__ */ jsx("p", { class: "text-sm font-medium text-on-surface-strong", children: formatWeekRange(weekStart) })
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "flex flex-col items-center justify-end gap-2", children: [
      /* @__PURE__ */ jsx(RandomizeBOTDButton, { weekStart, botdByDate }),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: `/dashboard/admin/planner/featured-hero/${weekKey}/prepare`,
          "x-target": "modal-root",
          children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "secondary", width: "auto", children: "Featured hero" })
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: `/dashboard/admin/planner/instagram/${weekKey}/prepare`,
          "x-target": "modal-root",
          class: instagramButtonClasses(instagramPrepared),
          children: instagramLabel
        }
      )
    ] })
  ] });
};
export {
  WeekCard_default as default
};
