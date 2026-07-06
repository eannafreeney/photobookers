import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { toWeekString } from "../../../../../lib/utils.js";
import ScheduleButton from "./ScheduleButton.js";
import DeleteButton from "./DeleteButton.js";
import CreatorEmailBadge from "./CreatorEmailBadge.js";
import SpotlightEmailStatusBadges from "./SpotlightEmailStatusBadges.js";
const PublisherOfTheWeek = ({
  weekStart,
  publisherOfTheWeek,
  interview
}) => {
  const weekKey = toWeekString(weekStart);
  const publisher = publisherOfTheWeek?.creator ?? null;
  return /* @__PURE__ */ jsxs("div", { class: "mt-3 pt-3 border-t border-outline", children: [
    /* @__PURE__ */ jsx("p", { class: "text-xs font-medium text-on-surface mb-2", children: "Publisher of the week" }),
    publisher ? /* @__PURE__ */ jsx(
      POTWCardContent,
      {
        weekKey,
        publisher,
        publisherOfTheWeek,
        interview
      }
    ) : /* @__PURE__ */ jsx(
      ScheduleButton,
      {
        href: `/dashboard/admin/planner/publisher-of-the-week/${weekKey}/create`,
        text: "Schedule publisher of the week"
      }
    )
  ] });
};
var POTWCard_default = PublisherOfTheWeek;
const POTWCardContent = ({
  weekKey,
  publisher,
  publisherOfTheWeek,
  interview
}) => {
  if (!publisherOfTheWeek) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { class: "flex items-start justify-between gap-3", children: [
      publisher.coverUrl && /* @__PURE__ */ jsx(
        "img",
        {
          src: publisher.coverUrl,
          alt: publisher.displayName,
          class: "h-16 w-16 rounded object-cover"
        }
      ),
      /* @__PURE__ */ jsx("div", { class: "min-w-0 flex-1", children: /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-1.5 flex-wrap", children: [
        /* @__PURE__ */ jsx("p", { class: "text-sm font-semibold text-on-surface-strong", children: publisher.displayName }),
        /* @__PURE__ */ jsx(
          CreatorEmailBadge,
          {
            name: publisher.displayName,
            creatorId: publisher.id,
            email: publisher.email
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx(
        DeleteButton,
        {
          action: `/dashboard/admin/planner/publisher-of-the-week/${weekKey}`
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "mt-2 border-t border-outline pt-2 flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx(
        SpotlightEmailStatusBadges,
        {
          spotlight: "publisher",
          row: publisherOfTheWeek,
          creatorId: publisher.id,
          email: publisher.email
        }
      ),
      interview && /* @__PURE__ */ jsxs("p", { class: "text-xs text-on-surface", children: [
        "Interview status: ",
        interview.status
      ] })
    ] })
  ] });
};
export {
  POTWCard_default as default
};
