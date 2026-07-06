import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { toWeekString } from "../../../../../lib/utils.js";
import ScheduleButton from "./ScheduleButton.js";
import DeleteButton from "./DeleteButton.js";
import CreatorEmailBadge from "./CreatorEmailBadge.js";
import SpotlightEmailStatusBadges from "./SpotlightEmailStatusBadges.js";
const AOTWCard = ({
  weekStart,
  artistOfTheWeek,
  interview
}) => {
  const weekKey = toWeekString(weekStart);
  const artist = artistOfTheWeek?.creator ?? null;
  return /* @__PURE__ */ jsxs("div", { class: "mt-3 pt-3 border-t border-outline", children: [
    /* @__PURE__ */ jsx("p", { class: "text-xs font-medium text-on-surface mb-2", children: "Artist of the week" }),
    artist ? /* @__PURE__ */ jsx(
      AOTWCardContent,
      {
        weekKey,
        artist,
        artistOfTheWeek,
        interview
      }
    ) : /* @__PURE__ */ jsx(
      ScheduleButton,
      {
        href: `/dashboard/admin/planner/artist-of-the-week/${weekKey}/create`,
        text: "Schedule artist of the week"
      }
    )
  ] });
};
var AOTWCard_default = AOTWCard;
const AOTWCardContent = ({
  weekKey,
  artist,
  artistOfTheWeek,
  interview
}) => {
  if (!artistOfTheWeek) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { class: "flex items-start justify-between gap-3", children: [
      artist.coverUrl && /* @__PURE__ */ jsx(
        "img",
        {
          src: artist.coverUrl,
          alt: artist.displayName,
          class: "h-16 w-16 rounded object-cover"
        }
      ),
      /* @__PURE__ */ jsx("div", { class: "min-w-0 flex-1", children: /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-1.5 flex-wrap", children: [
        /* @__PURE__ */ jsx("p", { class: "text-sm font-semibold text-on-surface-strong", children: artist.displayName }),
        /* @__PURE__ */ jsx(
          CreatorEmailBadge,
          {
            creatorId: artist.id,
            email: artist.email,
            name: artist.displayName
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx(
        DeleteButton,
        {
          action: `/dashboard/admin/planner/artist-of-the-week/${weekKey}`
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "mt-2 border-t border-outline pt-2 flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx(
        SpotlightEmailStatusBadges,
        {
          spotlight: "artist",
          row: artistOfTheWeek,
          creatorId: artist.id,
          email: artist.email
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
  AOTWCard_default as default
};
