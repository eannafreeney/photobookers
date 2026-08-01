import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../../../components/app/SectionTitle.js";
import Button from "../../../components/app/Button.js";
import ShareButton from "../../api/components/ShareButton.js";
import NewsletterCard from "./NewsletterCard.js";
import {
  aotwPath,
  botdPath,
  potwPath,
  thisWeekPath,
  thisWeekUrl
} from "../spotlightUrls.js";
import ExpandableDescription from "./ExpandableDescription.js";
import { toDateString, toWeekStart } from "../../../lib/utils.js";
import SpotlightCard from "../../../components/app/SpotlightCard.js";
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
    botdEntries.map((bookOfTheDay2) => {
      return /* @__PURE__ */ jsxs("section", { class: "flex flex-col items-center gap-4 mt-4 border-t border-outline pt-4", children: [
        /* @__PURE__ */ jsx(SectionTitle, { children: toDateString(bookOfTheDay2.date) }),
        /* @__PURE__ */ jsx(
          SpotlightCard,
          {
            href: botdPath(bookOfTheDay2.date),
            imageUrl: bookOfTheDay2.book.coverUrl ?? "",
            imageAlt: bookOfTheDay2.book.title,
            title: bookOfTheDay2.book.title,
            subtitle: bookOfTheDay2.book.artist?.displayName,
            className: "w-full max-w-none"
          }
        ),
        bookOfTheDay2.spotlightBlurb ? /* @__PURE__ */ jsx(ExpandableDescription, { text: bookOfTheDay2.spotlightBlurb }) : null
      ] });
    }),
    artistOfTheWeek ? /* @__PURE__ */ jsxs("section", { class: "flex flex-col items-center gap-4 mt-4 border-t border-outline pt-4", children: [
      /* @__PURE__ */ jsxs(SectionTitle, { children: [
        "Artist of the Week ",
        toDateString(artistOfTheWeek.weekStart)
      ] }),
      /* @__PURE__ */ jsx(
        SpotlightCard,
        {
          href: aotwPath(artistOfTheWeek.weekStart),
          imageUrl: artistOfTheWeek.featuredImageUrl ?? artistOfTheWeek.creator.coverUrl ?? "",
          imageAlt: artistOfTheWeek.creator.displayName,
          title: artistOfTheWeek.creator.displayName,
          subtitle: artistOfTheWeek.creator.city ?? void 0,
          className: "w-full max-w-none"
        }
      ),
      artistOfTheWeek.spotlightBlurb ? /* @__PURE__ */ jsx(ExpandableDescription, { text: artistOfTheWeek.spotlightBlurb }) : null
    ] }) : (
      // <ThisWeekCreatorSpotlight spotlight={artistOfTheWeek} />
      null
    ),
    publisherOfTheWeek ? /* @__PURE__ */ jsxs("section", { class: "flex flex-col items-center gap-4 mt-4 border-t border-outline pt-4", children: [
      /* @__PURE__ */ jsxs(SectionTitle, { children: [
        "Publisher of the Week ",
        toDateString(publisherOfTheWeek.weekStart)
      ] }),
      /* @__PURE__ */ jsx(
        SpotlightCard,
        {
          href: potwPath(publisherOfTheWeek.weekStart),
          imageUrl: publisherOfTheWeek.featuredImageUrl ?? publisherOfTheWeek.creator.coverUrl ?? "",
          imageAlt: publisherOfTheWeek.creator.displayName,
          title: publisherOfTheWeek.creator.displayName,
          subtitle: publisherOfTheWeek.creator.city ?? void 0,
          className: "w-full max-w-none"
        }
      ),
      publisherOfTheWeek.spotlightBlurb ? /* @__PURE__ */ jsx(ExpandableDescription, { text: publisherOfTheWeek.spotlightBlurb }) : null
    ] }) : null,
    /* @__PURE__ */ jsx(NewsletterCard, {}),
    /* @__PURE__ */ jsxs("nav", { class: "flex items-center justify-between gap-4 border-outline pt-4", children: [
      /* @__PURE__ */ jsx("a", { href: thisWeekPath(prevWeekStart), children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", width: "full", children: "\u2190 Previous week" }) }),
      canGoNext ? /* @__PURE__ */ jsx("a", { href: thisWeekPath(nextWeekStart), children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", width: "full", children: "Next week \u2192" }) }) : /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", width: "full", isDisabled: true, children: "Next week \u2192" })
    ] })
  ] });
};
var ThisWeekDetail_default = ThisWeekDetail;
export {
  ThisWeekDetail_default as default
};
