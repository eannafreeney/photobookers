import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import {
  Mjml,
  MjmlHead,
  MjmlTitle,
  MjmlFont,
  MjmlAttributes,
  MjmlAll,
  MjmlBreakpoint,
  MjmlBody,
  MjmlStyle
} from "mjml-react";
import {
  BookColumn,
  bookColumnCoverStyle,
  BookFeatureCard,
  CreatorColumn,
  FeatureRow,
  NewsletterAppPromo,
  NewsletterCtaButton,
  NewsletterFooter,
  NewsletterHeader,
  NewsletterIntro,
  NewsletterSubject,
  SectionHeading
} from "./MJMLComponents/index.js";
import { brand, newsletterWidthPx } from "./constants.js";
import { formatNewsletterWeekRange } from "./utils.js";
const chunk = (items, size) => Array.from(
  { length: Math.ceil(items.length / size) },
  (_, i) => items.slice(i * size, i * size + size)
);
const WeeklyNewsletterMjml = (params) => {
  const {
    weekStart,
    weekEnd,
    subject,
    introText,
    botdEntries,
    ctaText,
    ctaHref,
    newMembers,
    artistOfTheWeek,
    publisherOfTheWeek,
    trending
  } = params;
  const weekLabel = formatNewsletterWeekRange(weekStart, weekEnd);
  return /* @__PURE__ */ jsxs(Mjml, { lang: "en", children: [
    /* @__PURE__ */ jsxs(MjmlHead, { children: [
      /* @__PURE__ */ jsx(MjmlTitle, { children: subject }),
      /* @__PURE__ */ jsx(
        MjmlFont,
        {
          name: "Instrument Sans",
          href: "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap"
        }
      ),
      /* @__PURE__ */ jsx(
        MjmlFont,
        {
          name: "Fraunces",
          href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap"
        }
      ),
      /* @__PURE__ */ jsx(MjmlAttributes, { children: /* @__PURE__ */ jsx(MjmlAll, { fontFamily: brand.fontSans, color: brand.onSurface }) }),
      /* @__PURE__ */ jsx(MjmlStyle, { children: bookColumnCoverStyle }),
      /* @__PURE__ */ jsx(MjmlBreakpoint, { width: "600px" })
    ] }),
    /* @__PURE__ */ jsxs(MjmlBody, { backgroundColor: brand.surface, width: newsletterWidthPx, children: [
      /* @__PURE__ */ jsx(NewsletterHeader, {}),
      /* @__PURE__ */ jsx(NewsletterSubject, { subject, weekLabel }),
      introText.trim().length > 0 ? /* @__PURE__ */ jsx(NewsletterIntro, { introText }) : null,
      /* @__PURE__ */ jsx(NewsletterAppPromo, {}),
      botdEntries.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(SectionHeading, { kicker: "Daily picks", children: "Books of the day" }),
        botdEntries.map((book) => /* @__PURE__ */ jsx(BookFeatureCard, { book }, book.bookId))
      ] }) : null,
      artistOfTheWeek || publisherOfTheWeek ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(SectionHeading, { kicker: "Spotlight", children: "Creators of the week" }),
        /* @__PURE__ */ jsxs(FeatureRow, { children: [
          artistOfTheWeek ? /* @__PURE__ */ jsx(
            CreatorColumn,
            {
              creator: artistOfTheWeek
            },
            artistOfTheWeek.slug
          ) : null,
          publisherOfTheWeek ? /* @__PURE__ */ jsx(
            CreatorColumn,
            {
              creator: publisherOfTheWeek
            },
            publisherOfTheWeek.slug
          ) : null
        ] })
      ] }) : null,
      trending && trending.books.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(SectionHeading, { kicker: "Trending", children: "Top books this week" }),
        chunk(trending.books, 3).map((row) => /* @__PURE__ */ jsx(FeatureRow, { children: row.map((book) => /* @__PURE__ */ jsx(BookColumn, { book, compact: true }, book.bookId)) }, row.map((book) => book.bookId).join("-")))
      ] }) : null,
      trending && trending.artists.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(SectionHeading, { kicker: "Trending", children: "Top artists this week" }),
        chunk(trending.artists, 3).map((row) => /* @__PURE__ */ jsx(FeatureRow, { children: row.map((creator) => /* @__PURE__ */ jsx(CreatorColumn, { creator }, creator.slug)) }, row.map((creator) => creator.slug).join("-")))
      ] }) : null,
      trending && trending.publishers.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(SectionHeading, { kicker: "Trending", children: "Top publishers this week" }),
        chunk(trending.publishers, 3).map((row) => /* @__PURE__ */ jsx(FeatureRow, { children: row.map((creator) => /* @__PURE__ */ jsx(CreatorColumn, { creator }, creator.slug)) }, row.map((creator) => creator.slug).join("-")))
      ] }) : null,
      newMembers && newMembers.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(SectionHeading, { kicker: "Discover", children: "New on Photobookers" }),
        chunk(newMembers, 3).map((row) => /* @__PURE__ */ jsx(FeatureRow, { children: row.map((creator) => /* @__PURE__ */ jsx(CreatorColumn, { creator }, creator.slug)) }, row.map((creator) => creator.slug).join("-")))
      ] }) : null,
      /* @__PURE__ */ jsx(NewsletterCtaButton, { ctaText, href: ctaHref }),
      /* @__PURE__ */ jsx(NewsletterFooter, {})
    ] })
  ] });
};
export {
  WeeklyNewsletterMjml
};
