import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SpotlightCard from "../../../components/app/SpotlightCard.js";
import SectionTitle from "../../../components/app/SectionTitle.js";
import Button from "../../../components/app/Button.js";
import { SITE_APP, SITE_SKOOL } from "../../../constants/siteSocial.js";
import { formatCountry } from "../../../lib/utils.js";
import { aotwPath, botdPath, potwPath } from "../spotlightUrls.js";
import ExpandableDescription from "./ExpandableDescription.js";
const cardClassName = "w-full max-w-none";
const pageLinks = [
  { href: SITE_APP.ios.href, label: "Download the app", external: true },
  { href: "/newsletter", label: "Join the newsletter" },
  { href: SITE_SKOOL.href, label: "Publish Your Photobook", external: true }
];
const LinksPage = ({
  bookOfTheDay,
  artistOfTheWeek,
  publisherOfTheWeek,
  newlyVerifiedCreators,
  upcomingFairs = []
}) => {
  const hasContent = bookOfTheDay || artistOfTheWeek || publisherOfTheWeek || upcomingFairs.length > 0;
  return /* @__PURE__ */ jsxs("div", { class: "mx-auto flex w-full max-w-md flex-col gap-8", children: [
    /* @__PURE__ */ jsxs("header", { class: "flex flex-col items-center gap-2 border-b-2 border-t-2 border-on-surface-strong py-6 text-center", children: [
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/featured",
          class: "kicker text-accent transition-opacity hover:opacity-80",
          children: "Photobookers"
        }
      ),
      /* @__PURE__ */ jsx("h1", { class: "text-balance font-display text-2xl font-medium leading-tight text-on-surface-strong", children: "This week's highlights" }),
      /* @__PURE__ */ jsx("p", { class: "text-pretty text-sm text-on-surface", children: "Today's pick and this week's featured artist and publisher." })
    ] }),
    !hasContent ? /* @__PURE__ */ jsxs("p", { class: "text-center text-sm text-on-surface", children: [
      "Nothing featured right now.",
      " ",
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/featured",
          class: "underline decoration-accent underline-offset-4 hover:text-accent",
          children: "Explore Photobookers"
        }
      )
    ] }) : null,
    /* @__PURE__ */ jsx("nav", { class: "flex w-full flex-col gap-3", "aria-label": "Explore Photobookers", children: pageLinks.map((link) => /* @__PURE__ */ jsx(
      "a",
      {
        href: link.href,
        target: "external" in link && link.external ? "_blank" : void 0,
        class: "w-full",
        children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", width: "full", children: link.label })
      },
      link.href
    )) }),
    bookOfTheDay ? /* @__PURE__ */ jsxs("section", { class: "flex flex-col items-center gap-4 mt-4 border-t border-outline pt-4", children: [
      /* @__PURE__ */ jsx(SectionTitle, { children: "Book of the Day" }),
      /* @__PURE__ */ jsx(
        SpotlightCard,
        {
          href: botdPath(bookOfTheDay.date),
          imageUrl: bookOfTheDay.book.coverUrl ?? "",
          imageAlt: bookOfTheDay.book.title,
          title: bookOfTheDay.book.title,
          subtitle: bookOfTheDay.book.artist?.displayName,
          className: cardClassName
        }
      ),
      bookOfTheDay.spotlightBlurb ? /* @__PURE__ */ jsx(ExpandableDescription, { text: bookOfTheDay.spotlightBlurb }) : null
    ] }) : null,
    artistOfTheWeek ? /* @__PURE__ */ jsxs("section", { class: "flex flex-col items-center gap-4 mt-4 border-t border-outline pt-4", children: [
      /* @__PURE__ */ jsx(SectionTitle, { children: "Artist of the Week" }),
      /* @__PURE__ */ jsx(
        SpotlightCard,
        {
          href: aotwPath(artistOfTheWeek.weekStart),
          imageUrl: artistOfTheWeek.featuredImageUrl ?? artistOfTheWeek.creator.coverUrl ?? "",
          imageAlt: artistOfTheWeek.creator.displayName,
          title: artistOfTheWeek.creator.displayName,
          subtitle: [
            artistOfTheWeek.creator.city,
            formatCountry(artistOfTheWeek.creator.country ?? "")
          ].filter(Boolean).join(", ") || void 0,
          aspectSquare: true,
          className: cardClassName
        }
      ),
      artistOfTheWeek.spotlightBlurb ? /* @__PURE__ */ jsx(ExpandableDescription, { text: artistOfTheWeek.spotlightBlurb }) : null
    ] }) : null,
    publisherOfTheWeek ? /* @__PURE__ */ jsxs("section", { class: "flex flex-col items-center gap-4 mt-4 border-t border-outline pt-4", children: [
      /* @__PURE__ */ jsx(SectionTitle, { children: "Publisher of the Week" }),
      /* @__PURE__ */ jsx(
        SpotlightCard,
        {
          href: potwPath(publisherOfTheWeek.weekStart),
          imageUrl: publisherOfTheWeek.featuredImageUrl ?? publisherOfTheWeek.creator.coverUrl ?? "",
          imageAlt: publisherOfTheWeek.creator.displayName,
          title: publisherOfTheWeek.creator.displayName,
          subtitle: [
            publisherOfTheWeek.creator.city,
            formatCountry(publisherOfTheWeek.creator.country ?? "")
          ].filter(Boolean).join(", ") || void 0,
          aspectSquare: true,
          className: cardClassName
        }
      ),
      publisherOfTheWeek.spotlightBlurb ? /* @__PURE__ */ jsx(ExpandableDescription, { text: publisherOfTheWeek.spotlightBlurb }) : null
    ] }) : null,
    upcomingFairs.length > 0 ? /* @__PURE__ */ jsxs("section", { class: "flex flex-col items-center gap-4 mt-4 border-t border-outline pt-4", children: [
      /* @__PURE__ */ jsx(SectionTitle, { children: "Upcoming Fairs" }),
      /* @__PURE__ */ jsx("nav", { class: "flex w-full flex-col gap-3", "aria-label": "Fairs this week", children: upcomingFairs.map((fair) => /* @__PURE__ */ jsx("a", { href: `/fairs/${fair.slug}`, class: "w-full", children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", width: "full", children: fair.name }) }, fair.id)) })
    ] }) : null,
    newlyVerifiedCreators.length > 0 ? /* @__PURE__ */ jsxs("section", { class: "flex flex-col items-center gap-4 my-4 border-t border-b border-outline py-4", children: [
      /* @__PURE__ */ jsx(SectionTitle, { children: "New on photobookers" }),
      /* @__PURE__ */ jsx(
        "nav",
        {
          class: "flex w-full flex-col gap-3",
          "aria-label": "New on photobookers",
          children: newlyVerifiedCreators.map((creator) => /* @__PURE__ */ jsx(
            "a",
            {
              href: `/creators/${creator.slug}`,
              class: "w-full",
              children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", width: "full", children: creator.displayName })
            },
            creator.id
          ))
        }
      )
    ] }) : null,
    /* @__PURE__ */ jsx("a", { href: "/featured", class: "mx-auto ", children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", width: "auto", children: "Visit Photobookers" }) })
  ] });
};
var LinksPage_default = LinksPage;
export {
  LinksPage_default as default
};
