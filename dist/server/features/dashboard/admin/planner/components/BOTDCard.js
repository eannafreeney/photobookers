import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "../../../../../components/app/Link.js";
import { toDateString } from "../../../../../lib/utils.js";
import { formatDayWeekday } from "../utils.js";
import DeleteButton from "./DeleteButton.js";
import ScheduleButton from "./ScheduleButton.js";
import CreatorEmailBadge from "./CreatorEmailBadge.js";
import BotdEmailStatusBadges from "./BotdEmailStatusBadges.js";
const BOTDCard = ({ date, bookOfTheDay }) => {
  const dateKey = toDateString(date);
  const dayLabel = formatDayWeekday(date);
  return /* @__PURE__ */ jsxs("div", { class: "border-t border-outline pt-3", children: [
    /* @__PURE__ */ jsxs("p", { class: "text-xs font-medium text-on-surface mb-2", children: [
      dayLabel,
      " ",
      date.getUTCDate()
    ] }),
    bookOfTheDay?.book ? /* @__PURE__ */ jsx(BOTDCardContent, { dateKey, bookOfTheDay }) : /* @__PURE__ */ jsx(
      ScheduleButton,
      {
        href: `/dashboard/admin/planner/book-of-the-day/${dateKey}/create`,
        text: "Schedule Book of the Day"
      }
    )
  ] });
};
var BOTDCard_default = BOTDCard;
const BOTDCardContent = ({ dateKey, bookOfTheDay }) => {
  const book = bookOfTheDay?.book ?? null;
  if (!book) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { class: "flex items-start justify-between gap-3", children: [
      book.coverUrl && /* @__PURE__ */ jsx(
        "img",
        {
          src: book.coverUrl,
          alt: book.title,
          class: "h-16 w-12 rounded object-cover"
        }
      ),
      /* @__PURE__ */ jsxs("div", { class: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsx("p", { class: "text-sm font-semibold text-on-surface-strong line-clamp-2", children: book.title }),
        /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-1", children: [
          book.artist && /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-1.5 min-w-0", children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                href: `/creators/${book.artist.slug}`,
                className: "min-w-0",
                children: /* @__PURE__ */ jsx("p", { class: "text-xs text-on-surface truncate", children: book.artist.displayName })
              }
            ),
            /* @__PURE__ */ jsx(
              CreatorEmailBadge,
              {
                name: book.artist.displayName,
                creatorId: book.artist.id,
                email: book.artist.email
              }
            )
          ] }),
          book.publisher && /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-1.5 min-w-0", children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                href: `/creators/${book.publisher.slug}`,
                className: "min-w-0",
                children: /* @__PURE__ */ jsx("p", { class: "text-xs text-on-surface truncate", children: book.publisher.displayName })
              }
            ),
            /* @__PURE__ */ jsx(
              CreatorEmailBadge,
              {
                name: book.publisher.displayName,
                creatorId: book.publisher.id,
                email: book.publisher.email
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        DeleteButton,
        {
          action: `/dashboard/admin/planner/book-of-the-day/${dateKey}`
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { class: "mt-2 border-t border-outline pt-2 flex flex-col gap-2", children: /* @__PURE__ */ jsx(BotdEmailStatusBadges, { bookOfTheDay }) })
  ] });
};
export {
  BOTDCard_default as default
};
