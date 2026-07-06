import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../../../components/app/SectionTitle.js";
import Button from "../../../components/app/Button.js";
import ShareButton from "../../api/components/ShareButton.js";
import SpotlightCreatorLink from "./SpotlightCreatorLink.js";
import NewsletterCard from "./NewsletterCard.js";
import {
  botdPath,
  thisWeekPath,
  thisWeekUrl
} from "../spotlightUrls.js";
import { toDateString, toWeekStart } from "../../../lib/utils.js";
import { capitalize } from "../../../utils.js";
const ThisWeekDetail = async ({
  weekStart,
  weekRangeLabel,
  botdEntries,
  artistOfTheWeek,
  publisherOfTheWeek
}) => {
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setUTCDate(prevWeekStart.getUTCDate() - 7);
  const nextWeekStart = new Date(weekStart);
  nextWeekStart.setUTCDate(nextWeekStart.getUTCDate() + 7);
  const canGoNext = nextWeekStart.getTime() <= toWeekStart(/* @__PURE__ */ new Date()).getTime();
  return /* @__PURE__ */ jsxs("div", { class: "mx-auto flex w-full flex-col gap-4 md:max-w-lg", children: [
    /* @__PURE__ */ jsxs("header", { class: "flex flex-col items-center gap-3 border-b-2 border-on-surface-strong pb-6", children: [
      /* @__PURE__ */ jsxs("div", { class: "flex flex-col items-center gap-2 text-center", children: [
        /* @__PURE__ */ jsx("p", { class: "kicker text-accent", children: "This Week" }),
        /* @__PURE__ */ jsx("h1", { class: "text-balance font-display text-1xl md:text-2xl font-medium leading-tight text-on-surface-strong", children: weekRangeLabel })
      ] }),
      /* @__PURE__ */ jsx(
        ShareButton,
        {
          title: `This week on Photobookers \u2014 ${weekRangeLabel}`,
          text: `This week on Photobookers: ${weekRangeLabel}`,
          url: thisWeekUrl(weekStart)
        }
      )
    ] }),
    botdEntries.length > 0 ? /* @__PURE__ */ jsxs("section", { class: "flex flex-col gap-8", children: [
      /* @__PURE__ */ jsx(SectionTitle, { children: "Books of the Day" }),
      /* @__PURE__ */ jsx("div", { class: "flex flex-col gap-8", children: botdEntries.map((entry) => /* @__PURE__ */ jsx(ThisWeekBookEntry, { entry }, entry.id)) })
    ] }) : null,
    artistOfTheWeek ? /* @__PURE__ */ jsx(ThisWeekCreatorSpotlight, { spotlight: artistOfTheWeek }) : null,
    publisherOfTheWeek ? /* @__PURE__ */ jsx(ThisWeekCreatorSpotlight, { spotlight: publisherOfTheWeek }) : null,
    /* @__PURE__ */ jsx(NewsletterCard, {}),
    /* @__PURE__ */ jsxs("nav", { class: "flex items-center justify-between gap-4 border-outline pt-4", children: [
      /* @__PURE__ */ jsx("a", { href: thisWeekPath(prevWeekStart), children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", width: "full", children: "\u2190 Previous week" }) }),
      canGoNext ? /* @__PURE__ */ jsx("a", { href: thisWeekPath(nextWeekStart), children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", width: "full", children: "Next week \u2192" }) }) : /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", width: "full", isDisabled: true, children: "Next week \u2192" })
    ] })
  ] });
};
var ThisWeekDetail_default = ThisWeekDetail;
const ThisWeekBookEntry = ({ entry }) => {
  const { book } = entry;
  return /* @__PURE__ */ jsxs("div", { class: "flex gap-4 border-t border-outline pt-4", children: [
    book.coverUrl ? /* @__PURE__ */ jsx("a", { href: botdPath(entry.date), class: "shrink-0 transition-opacity hover:opacity-80", children: /* @__PURE__ */ jsx(
      "img",
      {
        src: book.coverUrl,
        alt: book.title,
        class: "aspect-3/4 w-24 object-cover border border-outline"
      }
    ) }) : null,
    /* @__PURE__ */ jsxs("div", { class: "flex min-w-0 flex-1 flex-col gap-1", children: [
      /* @__PURE__ */ jsx("p", { class: "kicker text-accent", children: toDateString(entry.date) }),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: botdPath(entry.date),
          class: "text-pretty font-display text-xl font-medium text-on-surface-strong transition-opacity hover:opacity-80 hover:underline decoration-accent decoration-1 underline-offset-4",
          children: book.title
        }
      ),
      book.artist ? /* @__PURE__ */ jsxs("div", { class: "flex flex-col items-start gap-2", children: [
        /* @__PURE__ */ jsx("p", { class: "truncate text-sm text-on-surface", children: book.artist.displayName }),
        /* @__PURE__ */ jsx("a", { href: `/books/${book.slug}`, children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", width: "md", children: "View Book" }) })
      ] }) : /* @__PURE__ */ jsx("a", { href: `/books/${book.slug}`, children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", width: "md", children: "View Book" }) })
    ] })
  ] });
};
const ThisWeekCreatorSpotlight = async ({
  spotlight
}) => {
  const { creator } = spotlight;
  const role = capitalize(creator.type);
  const title = `${role} of the Week`;
  const image = spotlight.instagramImageUrl ?? creator.coverUrl ?? creator.bannerUrl;
  return /* @__PURE__ */ jsxs("section", { class: "flex flex-col gap-6", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: title }),
    image ? /* @__PURE__ */ jsx(
      "img",
      {
        src: image,
        alt: creator.displayName,
        class: "w-full rounded-radius object-cover"
      }
    ) : null,
    creator.tagline?.trim() ? /* @__PURE__ */ jsx("p", { class: "text-pretty text-sm font-medium text-on-surface-strong", children: creator.tagline.trim() }) : null,
    /* @__PURE__ */ jsx(SpotlightCreatorLink, { creator, role })
  ] });
};
export {
  ThisWeekDetail_default as default
};
