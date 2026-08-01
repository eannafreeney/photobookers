import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Html, Body, Container, Tailwind } from "@react-email/components";
import {
  BookFeatureCard,
  CreatorFeatureCard,
  NewsletterAppPromo,
  NewsletterHeader,
  NewsletterSubject,
  NewsletterIntro,
  SectionHeading,
  NewsletterCtaButton,
  NewsletterFooter,
  NewsletterHead
} from "./ReactEmailComponents/index.js";
import { formatNewsletterWeekRange } from "./utils.js";
const chunk = (items, size) => Array.from(
  { length: Math.ceil(items.length / size) },
  (_, i) => items.slice(i * size, i * size + size)
);
const WeeklyNewsletter = (params) => {
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
  return /* @__PURE__ */ jsx(Html, { lang: "en", children: /* @__PURE__ */ jsxs(Tailwind, { children: [
    /* @__PURE__ */ jsx(NewsletterHead, { title: subject }),
    /* @__PURE__ */ jsx(Body, { children: /* @__PURE__ */ jsxs(Container, { className: "flex flex-col gap-6 my-6", children: [
      /* @__PURE__ */ jsx(NewsletterHeader, {}),
      /* @__PURE__ */ jsx(NewsletterSubject, { subject, weekLabel }),
      introText.trim().length > 0 && /* @__PURE__ */ jsx(NewsletterIntro, { introText }),
      /* @__PURE__ */ jsx(NewsletterAppPromo, {}),
      botdEntries.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(SectionHeading, { kicker: "Daily picks", children: "Books of the day" }),
        botdEntries.map((book) => /* @__PURE__ */ jsx(BookFeatureCard, { book }))
      ] }),
      (artistOfTheWeek || publisherOfTheWeek) && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(SectionHeading, { kicker: "Spotlight", children: "Creators of the week" }),
        artistOfTheWeek && /* @__PURE__ */ jsx(CreatorFeatureCard, { creator: artistOfTheWeek }),
        publisherOfTheWeek && /* @__PURE__ */ jsx(CreatorFeatureCard, { creator: publisherOfTheWeek })
      ] }),
      trending && trending.books.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(SectionHeading, { kicker: "Trending", children: "Top books this week" }),
        trending.books.map((book) => /* @__PURE__ */ jsx(BookFeatureCard, { book }))
      ] }),
      trending && trending.artists.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(SectionHeading, { kicker: "Trending", children: "Top artists this week" }),
        trending.artists.map((artist) => /* @__PURE__ */ jsx(CreatorFeatureCard, { creator: artist }))
      ] }),
      trending && trending.publishers.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(SectionHeading, { kicker: "Trending", children: "Top publishers this week" }),
        trending.publishers.map((publisher) => /* @__PURE__ */ jsx(CreatorFeatureCard, { creator: publisher }))
      ] }),
      newMembers && newMembers.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(SectionHeading, { kicker: "Discover", children: "New on Photobookers" }),
        chunk(newMembers, 3).map(
          (group) => group.map((member) => /* @__PURE__ */ jsx(CreatorFeatureCard, { creator: member }, member.slug))
        )
      ] }),
      /* @__PURE__ */ jsx(NewsletterCtaButton, { ctaText, href: ctaHref }),
      /* @__PURE__ */ jsx(NewsletterFooter, {})
    ] }) })
  ] }) });
};
export {
  WeeklyNewsletter
};
