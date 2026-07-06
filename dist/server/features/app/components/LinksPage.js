import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SpotlightCard from "../../../components/app/SpotlightCard.js";
import SectionTitle from "../../../components/app/SectionTitle.js";
import Button from "../../../components/app/Button.js";
import { SITE_APP } from "../../../constants/siteSocial.js";
import { formatCountry } from "../../../lib/utils.js";
import { aotwPath, botdPath, potwPath } from "../spotlightUrls.js";
const cardClassName = "w-full max-w-none";
const pageLinks = [
  { href: SITE_APP.ios.href, label: "Download the app", external: true },
  { href: "/newsletter", label: "Join the newsletter" }
];
const LinksPage = ({
  bookOfTheDay,
  artistOfTheWeek,
  publisherOfTheWeek,
  newlyVerifiedCreators
}) => {
  const hasContent = bookOfTheDay || artistOfTheWeek || publisherOfTheWeek;
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
    bookOfTheDay ? /* @__PURE__ */ jsxs("section", { class: "flex flex-col items-center gap-4", children: [
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
      )
    ] }) : null,
    artistOfTheWeek ? /* @__PURE__ */ jsxs("section", { class: "flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsx(SectionTitle, { children: "Artist of the Week" }),
      /* @__PURE__ */ jsx(
        SpotlightCard,
        {
          href: aotwPath(artistOfTheWeek.weekStart),
          imageUrl: artistOfTheWeek.instagramImageUrl ?? artistOfTheWeek.creator.coverUrl ?? "",
          imageAlt: artistOfTheWeek.creator.displayName,
          title: artistOfTheWeek.creator.displayName,
          subtitle: [
            artistOfTheWeek.creator.city,
            formatCountry(artistOfTheWeek.creator.country ?? "")
          ].filter(Boolean).join(", ") || void 0,
          aspectSquare: true,
          className: cardClassName
        }
      )
    ] }) : null,
    publisherOfTheWeek ? /* @__PURE__ */ jsxs("section", { class: "flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsx(SectionTitle, { children: "Publisher of the Week" }),
      /* @__PURE__ */ jsx(
        SpotlightCard,
        {
          href: potwPath(publisherOfTheWeek.weekStart),
          imageUrl: publisherOfTheWeek.instagramImageUrl ?? publisherOfTheWeek.creator.coverUrl ?? "",
          imageAlt: publisherOfTheWeek.creator.displayName,
          title: publisherOfTheWeek.creator.displayName,
          subtitle: [
            publisherOfTheWeek.creator.city,
            formatCountry(publisherOfTheWeek.creator.country ?? "")
          ].filter(Boolean).join(", ") || void 0,
          aspectSquare: true,
          className: cardClassName
        }
      )
    ] }) : null,
    newlyVerifiedCreators.length > 0 ? /* @__PURE__ */ jsxs("section", { class: "flex w-full flex-col items-center gap-4", children: [
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
    /* @__PURE__ */ jsx("a", { href: "/featured", class: "mx-auto", children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", width: "auto", children: "Visit Photobookers" }) })
  ] });
};
var LinksPage_default = LinksPage;
export {
  LinksPage_default as default
};
